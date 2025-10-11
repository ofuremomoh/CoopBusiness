# app/utils.py

from app.models import db, User, Wallet, Transaction
from datetime import datetime

ADMIN_FEE_PERCENT = 20  # company fee on in-house fiat-block exchanges


# -------------------------------------------------
# Helper Functions
# -------------------------------------------------

def calculate_category_limits():
    """Define top and sub-categories for the marketplace."""
    return {
        "intermediate": ["building materials", "ceramics", "metals", "plastics and rubbers", "woods"],
        "consumables": ["aluminium pots", "bleaches and disinfectants", "books", "branded charcoals", 
                        "cans and foils", "creams and lotions", "matches and toothpicks", 
                        "pads and diapers", "papers", "paper bags", "plastics", "stationery", 
                        "stoves", "tissue papers"],
        "fashion": ["fabrics and textiles", "leathers"],
        "technology": ["batteries", "computers", "cooling and heating", "fans", "homes", "lamps",
                       "mobiles", "multipurpose", "power", "security systems", "tools", "utensils", "vehicles"],
        "services": []
    }


# -------------------------------------------------
# SALES PROCESS
# -------------------------------------------------

def process_sale(buyer, seller, amount):
    """
    A buyer makes a purchase from a seller.
    The fiat goes to escrow, and we record the pending transaction.
    """
    # Create a transaction record
    transaction = Transaction(
        buyer_id=buyer.id,
        seller_id=seller.id,
        amount=amount,
        status="pending",
        created_at=datetime.utcnow()
    )
    db.session.add(transaction)
    db.session.commit()

    return {
        "message": "Sale recorded successfully. Awaiting delivery confirmation.",
        "transaction_id": transaction.id,
        "escrow_status": "funds held"
    }


def process_delivery(transaction):
    """
    Buyer confirms delivery:
    - Buyer gets 20% of purchase value in Block
    - Seller loses 10% of Block but receives 100% fiat
    - Transaction marked as completed
    """

    seller_wallet = Wallet.query.filter_by(user_id=transaction.seller_id).first()
    buyer_wallet = Wallet.query.filter_by(user_id=transaction.buyer_id).first()

    if not seller_wallet or not buyer_wallet:
        return {"error": "Wallet not found for buyer or seller"}

    amount = transaction.amount
    buyer_bonus = 0.20 * amount
    seller_deduction = 0.10 * amount

    # Update balances
    buyer_wallet.block_balance += buyer_bonus
    if seller_wallet.block_balance >= seller_deduction:
        seller_wallet.block_balance -= seller_deduction

    # Seller gets fiat into escrow (simulated here)
    seller_wallet.fiat_balance += amount

    # Update transaction
    transaction.status = "completed"
    transaction.completed_at = datetime.utcnow()

    db.session.commit()

    return {
        "message": "Delivery confirmed and rewards distributed.",
        "buyer_block_bonus": buyer_bonus,
        "seller_block_deduction": seller_deduction,
        "transaction_status": "completed"
    }


# -------------------------------------------------
# MARKETPLACE PROCESS
# -------------------------------------------------

def buy_block_from_user(buyer_id, listing):
    """
    Buyer purchases block from another user.
    - Seller loses block
    - Buyer gains block
    - Company collects 20% fiat fee
    """

    seller_wallet = Wallet.query.filter_by(user_id=listing.seller_id).first()
    buyer_wallet = Wallet.query.filter_by(user_id=buyer_id).first()

    if not seller_wallet or not buyer_wallet:
        return {"error": "Invalid wallets"}

    fiat_value = listing.fiat_value
    block_value = listing.block_price

    # Calculate company fee
    admin_fee = (ADMIN_FEE_PERCENT / 100) * fiat_value
    seller_receives = fiat_value - admin_fee

    # Ensure buyer has enough fiat
    if buyer_wallet.fiat_balance < fiat_value:
        return {"error": "Insufficient fiat balance"}, 400

    # Perform transfers
    buyer_wallet.fiat_balance -= fiat_value
    buyer_wallet.block_balance += block_value

    seller_wallet.fiat_balance += seller_receives

    # Remove the listing
    db.session.delete(listing)

    # Log transaction
    transaction = Transaction(
        buyer_id=buyer_id,
        seller_id=listing.seller_id,
        amount=fiat_value,
        status="completed",
        created_at=datetime.utcnow(),
        completed_at=datetime.utcnow()
    )

    db.session.add(transaction)
    db.session.commit()

    return {
        "message": "Block purchase successful",
        "block_received": block_value,
        "fiat_spent": fiat_value,
        "seller_received": seller_receives,
        "admin_fee": admin_fee
    }


# -------------------------------------------------
# INITIAL BLOCK ALLOCATION
# -------------------------------------------------
def allocate_initial_blocks(user):
    """
    Allocate block balances based on user type:
    - Individual: 100,000
    - Venture (CAC Business Name): 500,000
    - Company (CAC Registered): 1,000,000
    """
    wallet = Wallet.query.filter_by(user_id=user.id).first()

    if not wallet:
        wallet = Wallet(user_id=user.id, fiat_balance=0.0, block_balance=0.0)
        db.session.add(wallet)

    if user.category == "individual":
        initial_allocation = 100_000
    elif user.category == "venture":
        initial_allocation = 500_000
    elif user.category == "company":
        initial_allocation = 1_000_000
    else:
        initial_allocation = 0

    wallet.block_balance = initial_allocation
    wallet.initial_block_allocation = initial_allocation  # <-- store the reference value
    db.session.commit()

    return {"message": "Initial blocks allocated", "block_balance": wallet.block_balance}

def has_exhausted_initial_blocks(user):
    """
    Checks if the user has spent up to their initial allocated block balance
    (based on completed orders).
    """
    from models import Order, Wallet

    wallet = Wallet.query.filter_by(user_id=user.id).first()
    if not wallet:
        return False

    total_spent = (
        db.session.query(db.func.sum(Order.amount))
        .filter(Order.buyer_id == user.id, Order.status == "COMPLETED")
        .scalar()
    ) or 0.0

    # Use the stored initial allocation for comparison
    required_spend = wallet.initial_block_allocation or 0.0

    if total_spent >= required_spend:
        return True
    return False
