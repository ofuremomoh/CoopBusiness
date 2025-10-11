# app/routes/wallet_routes.py

from flask import Blueprint, jsonify, request
from decimal import Decimal
from app.models import db, User, Wallet, BlockLedger
from app.auth.views import token_required

wallet_bp = Blueprint("wallet", __name__)


# -----------------------------------
# Get wallet details
# -----------------------------------
@wallet_bp.route("/wallet", methods=["GET"])
@token_required
def get_wallet(user):
    """Return wallet balances for the logged-in user"""
    print(user)
    print("✅ Wallet route hit")
    print("Headers received:", dict(request.headers))
    wallet = Wallet.query.filter_by(user_id=user.id).first()
    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404

    return jsonify({
        "user_id": user.id,
        "name": user.name,
        "block_balance": str(wallet.block_balance),
        "fiat_balance": str(wallet.fiat_balance),
        "created_at": str(wallet.created_at),
        "paystack_bank_name": str(wallet.paystack_bank_name),
        "paystack_dedicated_account": str(wallet.paystack_dedicated_account)
    })


# -----------------------------------
# Add fiat to wallet (for testing)
# -----------------------------------
@wallet_bp.route("wallet/deposit_fiat", methods=["POST"])
@token_required
def deposit_fiat(user):
    """
    Simulate adding fiat funds to wallet (not through Paystack).
    Body: {"amount": 5000}
    """
    data = request.get_json() or {}
    amount = Decimal(str(data.get("amount", 0)))

    if amount <= 0:
        return jsonify({"error": "Invalid deposit amount"}), 400

    with db.session.begin():
        wallet = Wallet.query.filter_by(user_id=user.id).first()
        wallet.fiat_balance += amount

    return jsonify({
        "message": f"₦{amount} deposited successfully",
        "fiat_balance": str(wallet.fiat_balance)
    })


# -----------------------------------
# Withdraw fiat (manual simulation)
# -----------------------------------
@wallet_bp.route("wallet/withdraw_fiat", methods=["POST"])
@token_required
def withdraw_fiat(user):
    """
    Simulate fiat withdrawal from wallet
    Body: {"amount": 3000}
    """
    data = request.get_json() or {}
    amount = Decimal(str(data.get("amount", 0)))

    if amount <= 0:
        return jsonify({"error": "Invalid withdrawal amount"}), 400

    wallet = Wallet.query.filter_by(user_id=user.id).first()
    if wallet.fiat_balance < amount:
        return jsonify({"error": "Insufficient balance"}), 400

    with db.session.begin():
        wallet.fiat_balance -= amount

    return jsonify({
        "message": f"₦{amount} withdrawn successfully",
        "fiat_balance": str(wallet.fiat_balance)
    })


# -----------------------------------
# View block ledger (transactions)
# -----------------------------------
@wallet_bp.route("/wallet/ledger", methods=["GET"])
@token_required
def get_ledger(user):
    """
    Get all block balance changes (history)
    """
    entries = (
        BlockLedger.query.filter_by(user_id=user.id)
        .order_by(BlockLedger.timestamp.desc())
        .all()
    )
    
    history = []
    for e in entries:
        history.append({
            "change": str(e.change),
            "balance_after": str(e.balance_after),
            "reason": e.reason,
            "timestamp": str(e.timestamp)
        })

    return jsonify({"ledger": history})



# app/routes/referral_routes.py

from flask import Blueprint, request, jsonify
from decimal import Decimal
from app.models import db, User, Wallet, Referral, BlockLedger

# -----------------------------------
# Generate referral code
# -----------------------------------
@wallet_bp.route("wallet/generate", methods=["POST"])
@token_required
def generate_referral_code(user):
    """
    Creates a unique referral code for a user.
    Each user can have only one.
    """
    if user.referral_code:
        return jsonify({"message": "Referral code already exists", "code": user.referral_code}), 200

    import uuid
    code = str(uuid.uuid4())[:8].upper()
    user.referral_code = code
    db.session.commit()

    return jsonify({"message": "Referral code created", "code": code}), 201


# -----------------------------------
# Register referred user
# -----------------------------------
@wallet_bp.route("wallet/apply", methods=["POST"])
@token_required
def apply_referral(user):
    """
    A new user applies a referral code after registration.
    Example body:
    {
        "referral_code": "ABC12345"
    }
    """
    data = request.get_json() or {}
    code = data.get("referral_code")

    if not code:
        return jsonify({"error": "Referral code required"}), 400

    referrer = User.query.filter_by(referral_code=code).first()
    if not referrer:
        return jsonify({"error": "Invalid referral code"}), 404

    existing = Referral.query.filter_by(referred_id=user.id).first()
    if existing:
        return jsonify({"error": "Referral already applied"}), 400

    referral = Referral(referrer_id=referrer.id, referred_id=user.id)
    db.session.add(referral)
    db.session.commit()

    return jsonify({"message": f"Referral applied successfully. Referrer ID: {referrer.id}"}), 201


# -----------------------------------
# Reward referrer after first transaction
# -----------------------------------
def reward_referrer(buyer_id, transaction_value):
    """
    Called when a referred user completes their first transaction.
    The referrer earns 5% of transaction_value in block.
    """
    referral = Referral.query.filter_by(referred_id=buyer_id).first()
    if not referral or referral.rewarded:
        return  # No reward or already rewarded

    referrer_wallet = Wallet.query.filter_by(user_id=referral.referrer_id).first()
    reward_amount = Decimal(transaction_value) * Decimal("0.05")

    with db.session.begin():
        referrer_wallet.block_balance += reward_amount
        referral.rewarded = True
        db.session.add(BlockLedger(
            user_id=referral.referrer_id,
            change=reward_amount,
            balance_after=referrer_wallet.block_balance,
            reason=f"Referral reward from referred user {buyer_id}"
        ))

    return True


# -----------------------------------
# View my referrals
# -----------------------------------
@wallet_bp.route("wallet/my_referrals", methods=["GET"])
@token_required
def get_my_referrals(user):
    """
    Returns all users referred by the current user.
    """
    referrals = Referral.query.filter_by(referrer_id=user.id).all()
    results = []

    for r in referrals:
        referred_user = User.query.get(r.referred_id)
        results.append({
            "referred_user_id": r.referred_id,
            "referred_user_name": referred_user.name if referred_user else "Unknown",
            "rewarded": r.rewarded,
            "created_at": r.created_at.isoformat()
        })

    return jsonify(results)


# -----------------------------------
# View my referral rewards
# -----------------------------------
@wallet_bp.route("wallet/rewards", methods=["GET"])
@token_required
def view_referral_rewards(user):
    """
    Shows total earned from referrals.
    """
    ledger_entries = BlockLedger.query.filter_by(user_id=user.id).all()
    rewards = [
        e for e in ledger_entries if "Referral reward" in e.reason
    ]
    total_earned = sum(Decimal(e.change) for e in rewards)

    return jsonify({
        "total_earned": str(total_earned),
        "entries": [
            {"amount": str(e.change), "reason": e.reason, "date": e.timestamp.isoformat()}
            for e in rewards
        ]
    })
