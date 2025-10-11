# app/routes/ledger_routes.py

from flask import Blueprint, jsonify, request
from decimal import Decimal
from datetime import datetime, timedelta

from app.models import db, User, Wallet, BlockLedger, Transaction, ExchangeListing
from app.auth.views import token_required

ledger_bp = Blueprint("ledger", __name__, url_prefix="/ledger")

# -----------------------------------
# Get current wallet info
# -----------------------------------
@ledger_bp.route("/wallet", methods=["GET"])
@token_required
def get_wallet_summary(user):
    """
    Returns wallet summary for current user.
    """
    wallet = Wallet.query.filter_by(user_id=user.id).first()
    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404

    return jsonify({
        "user_id": user.id,
        "block_balance": str(wallet.block_balance),
        "total_mined": str(wallet.total_mined),
        "fiat_balance": str(wallet.fiat_balance),
        "last_updated": wallet.updated_at.isoformat()
    })


# -----------------------------------
# Get full block ledger for user
# -----------------------------------
@ledger_bp.route("/history", methods=["GET"])
@token_required
def get_ledger_history(user):
    """
    Returns all ledger entries (block transactions) for a user.
    Query params:
      - type=mining|spending|transfer|referral
    """
    entry_type = request.args.get("type")
    query = BlockLedger.query.filter_by(user_id=user.id).order_by(BlockLedger.timestamp.desc())

    if entry_type:
        query = [e for e in query if entry_type.lower() in e.reason.lower()]
    else:
        query = query.all()

    return jsonify([
        {
            "id": e.id,
            "change": str(e.change),
            "balance_after": str(e.balance_after),
            "reason": e.reason,
            "timestamp": e.timestamp.isoformat(),
        }
        for e in query
    ])


# -----------------------------------
# Get transaction history
# -----------------------------------
@ledger_bp.route("/transactions", methods=["GET"])
@token_required
def get_transaction_history(user):
    """
    Returns all fiat-based sales/purchases done by the user.
    """
    sent = Transaction.query.filter_by(buyer_id=user.id).all()
    received = Transaction.query.filter_by(seller_id=user.id).all()

    return jsonify({
        "purchases": [
            {
                "id": t.id,
                "amount": str(t.amount),
                "status": t.status,
                "created_at": t.created_at.isoformat(),
                "seller_id": t.seller_id,
                "type": "purchase"
            }
            for t in sent
        ],
        "sales": [
            {
                "id": t.id,
                "amount": str(t.amount),
                "status": t.status,
                "created_at": t.created_at.isoformat(),
                "buyer_id": t.buyer_id,
                "type": "sale"
            }
            for t in received
        ]
    })


# -----------------------------------
# View overall platform stats (admin only)
# -----------------------------------
@ledger_bp.route("/platform_summary", methods=["GET"])
@token_required
def get_platform_summary(user):
    """
    Returns overall platform economic data (admin only).
    Shows:
      - total minted blocks
      - circulating blocks
      - number of transactions
      - platform fees collected
    """
    if not user.is_admin:
        return jsonify({"error": "Admin access only"}), 403

    total_wallet_blocks = db.session.query(db.func.sum(Wallet.block_balance)).scalar() or Decimal("0")
    total_minted = db.session.query(db.func.sum(Wallet.total_mined)).scalar() or Decimal("0")
    total_transactions = Transaction.query.count()
    total_fees = db.session.query(db.func.sum(Transaction.platform_fee)).scalar() or Decimal("0")

    active_listings = ExchangeListing.query.filter_by(status="active").count()
    sold_listings = ExchangeListing.query.filter_by(status="sold").count()

    return jsonify({
        "total_minted": str(total_minted),
        "circulating_blocks": str(total_wallet_blocks),
        "total_transactions": total_transactions,
        "platform_fees_collected": str(total_fees),
        "active_listings": active_listings,
        "sold_listings": sold_listings
    })


# -----------------------------------
# Filter ledger by date range
# -----------------------------------
@ledger_bp.route("/filter", methods=["GET"])
@token_required
def filter_ledger_by_date(user):
    """
    Filter block ledger by date range.
    Example query: ?start=2025-01-01&end=2025-02-01
    """
    start = request.args.get("start")
    end = request.args.get("end")

    if not start or not end:
        return jsonify({"error": "Provide start and end dates"}), 400

    start_date = datetime.fromisoformat(start)
    end_date = datetime.fromisoformat(end)

    entries = (
        BlockLedger.query.filter(
            BlockLedger.user_id == user.id,
            BlockLedger.timestamp >= start_date,
            BlockLedger.timestamp <= end_date,
        )
        .order_by(BlockLedger.timestamp.desc())
        .all()
    )

    return jsonify([
        {
            "id": e.id,
            "change": str(e.change),
            "balance_after": str(e.balance_after),
            "reason": e.reason,
            "timestamp": e.timestamp.isoformat()
        }
        for e in entries
    ])
