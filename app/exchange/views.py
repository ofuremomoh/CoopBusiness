# app/routes/exchange_routes.py

from flask import Blueprint, request, jsonify
from decimal import Decimal
from datetime import datetime
from app.models import db, User, Wallet, ExchangeListing, BlockLedger
from app.auth.views import token_required

exchange_bp = Blueprint("exchange", __name__)
'''
@exchange_bp.route("/exchange/buy", methods=["POST"])
@token_required
def buy_blocks(user):
    print("✅ /exchange/buy route hit")

    data = request.get_json() or {}
    listing_id = data.get("listing_id")

    listing = ExchangeListing.query.get(listing_id)
    if not listing or listing.status != "ACTIVE":
        return jsonify({"error": "Listing not found or inactive"}), 404

    total_price = listing.block_amount * listing.rate_per_block
    seller_wallet = Wallet.query.filter_by(user_id=listing.seller_id).first()
    buyer_wallet = Wallet.query.filter_by(user_id=user.id).first()
    admin_wallet = Wallet.query.filter_by(user_id=1).first()  # Admin

    fee = total_price * Decimal("0.20")
    seller_earning = total_price - fee
    mined_fee_blocks = listing.block_amount * Decimal("0.20")

    try:
        buyer_wallet.block_balance += listing.block_amount
        db.session.add(BlockLedger(
            user_id=user.id,
            change=listing.block_amount,
            balance_after=buyer_wallet.block_balance,
            reason=f"Purchased {listing.block_amount} blocks from seller {listing.seller_id}"
        ))

        if admin_wallet:
            admin_wallet.block_balance += mined_fee_blocks
            db.session.add(BlockLedger(
                user_id=admin_wallet.user_id,
                change=mined_fee_blocks,
                balance_after=admin_wallet.block_balance,
                reason="Platform mining reward (exchange fee)"
            ))

        listing.status = "SOLD"
        listing.sold_at = datetime.utcnow()
        listing.buyer_id = user.id

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        print("❌ Transaction failed:", e)
        return jsonify({"error": "Purchase failed"}), 500

    return jsonify({
        "message": "Purchase completed successfully",
        "blocks_transferred": str(listing.block_amount),
        "seller_earning": str(seller_earning),
        "platform_fee": str(fee),
        "buyer_new_balance": str(buyer_wallet.block_balance)
    })

'''

@exchange_bp.route("/exchange/buy", methods=["POST"])
@token_required
def buy_blocks(user):
    """
    Temporarily disabled purchase logic.
    Simply tells the user to fund their wallet before buying.
    """
    print("✅ /exchange/buy route hit — logic disabled for now")
    return jsonify({"message": "Fund your wallet to buy"}), 200

# -----------------------------------
# Seller lists blocks for sale
# -----------------------------------
@exchange_bp.route("/exchange/list", methods=["POST"])
@token_required
def list_blocks_for_sale(user):
    """
    User lists a quantity of their block balance for sale.
    Example body:
    {
        "quantity": 50,
        "rate_per_block": 200
    }
    """
    data = request.get_json() or {}
    quantity = Decimal(str(data.get("quantity", 0)))
    price_per_unit = Decimal(str(data.get("price_per_unit", 0)))

    if quantity <= 0 or price_per_unit <= 0:
        return jsonify({"error": "Invalid quantity or price"}), 400

    wallet = Wallet.query.filter_by(user_id=user.id).first()
    if wallet.block_balance < quantity:
        return jsonify({"error": "Insufficient block balance"}), 400

    # Lock blocks in escrow for sale
    wallet.block_balance -= quantity

    listing = ExchangeListing(
        seller_id=user.id,
        block_amount=quantity,
        rate_per_block=price_per_unit
    )
    db.session.add(listing)

    db.session.add(BlockLedger(
        user_id=user.id,
        change=-quantity,
        balance_after=wallet.block_balance,
        reason=f"Listed {quantity} blocks for sale"
    ))

    db.session.commit()  # ✅ safe explicit commit

    return jsonify({
        "message": "Blocks listed for sale successfully",
        "listing_id": listing.id,
        "remaining_balance": str(wallet.block_balance)
    }), 201


# -----------------------------------
# Get all active listings
# -----------------------------------
@exchange_bp.route("/exchange/listings", methods=["GET"])
def get_all_listings():
    listings = ExchangeListing.query.all()
    data = []

    for l in listings:
        seller = User.query.get(l.seller_id)
        total_price = l.block_amount * l.rate_per_block
        data.append({
            "id": l.id,
            "seller_id": l.seller_id,
            "seller_name": seller.name if seller else "Unknown",
            "quantity": str(l.block_amount),
            "price_per_unit": str(l.rate_per_block),
            "total_price": str(total_price),
            "min_purchase": str(l.min_purchase),
            "max_purchase": str(l.max_purchase),
            "status": l.status,
            "created_at": l.created_at.isoformat()
        })
    
    return jsonify(data)


# -----------------------------------
# Buyer purchases listed blocks
# -----------------------------------
