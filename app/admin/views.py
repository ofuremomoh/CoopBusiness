# app/routes/admin_routes.py

from flask import Blueprint, jsonify, request
from decimal import Decimal
from app.models import db, User, Wallet, Category, Transaction
from app.auth.views import token_required

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


# -----------------------------------
# Admin-only decorator
# -----------------------------------
def admin_required(func):
    from functools import wraps

    @wraps(func)
    def wrapper(user, *args, **kwargs):
        if not user.is_admin:
            return jsonify({"error": "Admin access only"}), 403
        return func(user, *args, **kwargs)
    return wrapper


# -----------------------------------
# Seed main categories and subcategories
# -----------------------------------
@admin_bp.route("/seed_categories", methods=["POST"])
@token_required
@admin_required
def seed_categories(user):
    """
    Seeds the initial categories and subcategories.
    """
    categories = {
        "Intermediate": [
            "Building Materials", "Ceramics", "Metals", "Plastics and Rubbers", "Woods"
        ],
        "Consumables": [
            "Aluminium Pots", "Bleaches and Disinfectants", "Books", "Branded Charcoals",
            "Cans and Foils", "Creams and Lotions", "Matches and Toothpicks", "Pads and Diapers",
            "Papers", "Paper Bags", "Plastics", "Stationery", "Stoves", "Tissue Papers"
        ],
        "Fashion": ["Fabrics and Textiles", "Leathers"],
        "Technology": [
            "Batteries", "Computers", "Cooling and Heating", "Fans", "Homes",
            "Lamps", "Mobiles", "Multipurpose", "Power", "Security Systems",
            "Tools", "Utensils", "Vehicles"
        ],
        "Services": ["Maintenance", "Consulting", "Training", "Delivery", "Freelancing"]
    }

    with db.session.begin():
        for name, subcats in categories.items():
            category = Category.query.filter_by(name=name).first()
            if not category:
                category = Category(name=name)
                db.session.add(category)
                db.session.flush()  # get category.id

            for sub in subcats:
                existing = SubCategory.query.filter_by(name=sub, category_id=category.id).first()
                if not existing:
                    db.session.add(SubCategory(name=sub, category_id=category.id))

    return jsonify({"message": "Categories and subcategories seeded successfully"}), 201


# -----------------------------------
# Adjust user block balance manually
# -----------------------------------
@admin_bp.route("/adjust_block_balance", methods=["POST"])
@token_required
@admin_required
def adjust_block_balance(user):
    """
    Manually add or deduct blocks from a user.
    Example body:
    {
        "user_id": 5,
        "amount": 5000,
        "action": "add" | "deduct"
    }
    """
    data = request.get_json() or {}
    user_id = data.get("user_id")
    amount = Decimal(str(data.get("amount", 0)))
    action = data.get("action")

    target_user = User.query.get(user_id)
    wallet = Wallet.query.filter_by(user_id=user_id).first()

    if not target_user or not wallet:
        return jsonify({"error": "User not found"}), 404

    with db.session.begin():
        if action == "add":
            wallet.block_balance += amount
        elif action == "deduct":
            if wallet.block_balance < amount:
                return jsonify({"error": "Insufficient block balance"}), 400
            wallet.block_balance -= amount
        else:
            return jsonify({"error": "Invalid action"}), 400

    return jsonify({
        "message": f"Wallet updated successfully for user {user_id}",
        "new_balance": str(wallet.block_balance)
    })


# -----------------------------------
# Freeze or unfreeze a user
# -----------------------------------
@admin_bp.route("/freeze_user", methods=["POST"])
@token_required
@admin_required
def freeze_user(user):
    """
    Freezes a user account from trading or logging in.
    Example body:
    {
        "user_id": 4,
        "freeze": true
    }
    """
    data = request.get_json() or {}
    user_id = data.get("user_id")
    freeze = bool(data.get("freeze", True))

    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "User not found"}), 404

    target_user.is_frozen = freeze
    db.session.commit()

    status = "frozen" if freeze else "unfrozen"
    return jsonify({"message": f"User {target_user.name} has been {status}"}), 200


# -----------------------------------
# Get escrow and system financial summary
# -----------------------------------
@admin_bp.route("/escrow_summary", methods=["GET"])
@token_required
@admin_required
def get_escrow_summary(user):
    """
    Returns total escrow funds per seller and overall escrow balance.
    """
    escrow_data = (
        db.session.query(
            Transaction.seller_id,
            db.func.sum(Transaction.amount).label("total_held")
        )
        .filter(Transaction.status == "escrow")
        .group_by(Transaction.seller_id)
        .all()
    )

    results = []
    total_escrow = Decimal("0")

    for record in escrow_data:
        seller = User.query.get(record.seller_id)
        results.append({
            "seller_id": record.seller_id,
            "seller_name": seller.name if seller else "Unknown",
            "escrow_balance": str(record.total_held)
        })
        total_escrow += record.total_held or Decimal("0")

    return jsonify({
        "escrow_summary": results,
        "total_escrow": str(total_escrow)
    })


# -----------------------------------
# Get overall platform user stats
# -----------------------------------
@admin_bp.route("/stats", methods=["GET"])
@token_required
@admin_required
def get_platform_stats(user):
    """
    Returns platform user and transaction metrics.
    """
    total_users = User.query.count()
    total_businesses = User.query.filter_by(role="business").count()
    total_companies = User.query.filter_by(role="company").count()
    total_transactions = Transaction.query.count()

    active_wallets = db.session.query(db.func.count(Wallet.id)).filter(Wallet.block_balance > 0).scalar()

    return jsonify({
        "total_users": total_users,
        "total_businesses": total_businesses,
        "total_companies": total_companies,
        "total_transactions": total_transactions,
        "active_wallets": active_wallets
    })
