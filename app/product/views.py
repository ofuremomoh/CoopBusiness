# app/routes/product_routes.py

from flask import Blueprint, request, jsonify,send_from_directory,current_app
from decimal import Decimal
from datetime import datetime
from app.models import db, User, Wallet, Product, Transaction, BlockLedger, Order
from app.auth.views import token_required
import os
import uuid
from werkzeug.utils import secure_filename

product_bp = Blueprint("product", __name__)


UPLOAD_FOLDER = 'C:/Users/DELL/Documents/My Dev Files/cobiz/uploads' 

#UPLOAD_FOLDER = "/data/server_assets"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ----------------------------- 
# Add new product (seller)
# -----------------------------

import os
import uuid
from decimal import Decimal
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename

import base64

@product_bp.route("/product/add", methods=["POST"])
@token_required
def add_product(user):
    wallet = Wallet.query.filter_by(user_id=user.id).first()
    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404

    # JSON or multipart/form-data
    if request.content_type.startswith("multipart/form-data"):
        title = request.form.get("title")
        description = request.form.get("description")
        price = Decimal(request.form.get("price", "0"))
        category = request.form.get("category")
        subcategory = request.form.get("subcategory")
        image_file = request.files.get("image_file")
        image_data = request.form.get("image_url")  # base64 string if sent
    else:
        data = request.get_json() or {}
        title = data.get("title")
        description = data.get("description")
        price = Decimal(str(data.get("price", 0)))
        category = data.get("category")
        subcategory = data.get("subcategory")
        image_file = None
        image_data = data.get("image_url")  # base64 string

    if price <= 0:
        return jsonify({"error": "Invalid price"}), 400

    limit = wallet.block_balance * 10
    if price > limit:
        return jsonify({"error": f"Price exceeds your sales limit (max ₦{limit})"}), 400

    # Handle file upload or base64 image
    image_url = None
    
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    

    if image_file and allowed_file(image_file.filename):
        # Multipart/form-data file upload
        filename = secure_filename(image_file.filename)
        unique_str = uuid.uuid4().hex
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{unique_str}{ext}"
        image_file.save(os.path.join(UPLOAD_FOLDER, filename))
        image_url = filename
    elif image_data and image_data.startswith("data:"):
        # Base64 image sent as string
        header, encoded = image_data.split(",", 1)
        ext = header.split("/")[1].split(";")[0]  # png, jpeg etc.
        unique_str = uuid.uuid4().hex
        filename = f"{unique_str}.{ext}"
        with open(os.path.join(UPLOAD_FOLDER, filename), "wb") as f:
            f.write(base64.b64decode(encoded))
        image_url = filename

    # Create product
    product = Product(
        seller_id=user.id,
        title=title,
        description=description,
        price=price,
        category=category,
        subcategory=subcategory,
        image_url=image_url
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        "message": "Product listed successfully",
        "product_id": product.id,
        "image_url": product.image_url
    }), 201


# -----------------------------
# Get all products or by category
# -----------------------------
@product_bp.route("/product/list", methods=["GET"])
def list_products():
    """
    Optional query param: ?category=technology
    """
    category = request.args.get("category")
    query = Product.query
    if category:
        query = query.filter_by(category=category)
    products = query.order_by(Product.created_at.desc()).all()

    results = []
    for p in products:
        # Construct full image URL if exists
        image_url = f"{request.host_url.rstrip('/')}/api/uploads/{p.image_url}" if p.image_url else None

        results.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "price": str(p.price),
            "category": p.category,
            "subcategory": p.subcategory,
            "seller_id": p.seller_id,
            "seller_name": p.seller.name if p.seller else "Unknown",
            "image_url": image_url
        })

    return jsonify(results)



# -----------------------------
# Get single product details
# -----------------------------
@product_bp.route("/product/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Construct full image URL if it exists
    image_url = None
    if product.image_url:
        image_url = f"{request.host_url.rstrip('/')}/api/uploads/{product.image_url}"

    return jsonify({
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "price": str(product.price),
        "category": product.category,
        "subcategory": product.subcategory,
        "seller_id": product.seller_id,
        "seller_name": product.seller.name if product.seller else "Unknown",
        "image_url": image_url
    })




# ------------------ Get User Orders ------------------
@product_bp.route("product/orders/mine", methods=["GET"])
@token_required
def my_orders(user):
    """List all orders for the current user."""
    current_user_id = user.id
    orders = Order.query.filter(
        (Order.buyer_id == current_user_id) | (Order.seller_id == current_user_id)
    ).order_by(Order.created_at.desc()).all()

    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "product_id": order.product_id,
            "product_name": order.product.title if order.product else None,
            "buyer_id": order.buyer_id,
            "seller_id": order.seller_id,
            "total_price": float(order.price),
            "status":  str(order.status),
            "created_at": order.created_at.isoformat()
        })

    return jsonify(result), 200

import enum
# ------------------ Get Specific Order ------------------
@product_bp.route("product/orders/<int:order_id>", methods=["GET"])
@token_required
def get_order(user,order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    data = {
        "id": order.id,
        "buyer_id": order.buyer_id,
        "seller_id": order.seller_id,
        "product_id": order.product_id,
        "total_price": float(order.price),
        "status": str(order.status),
        "created_at": order.created_at.isoformat()
    }
    return jsonify(data), 200


# ------------------ Cancel Order ------------------
@product_bp.route("/product/orders/<int:order_id>/cancel", methods=["POST"])
@token_required
def cancel_order(user, order_id):
    """
    Cancel pending order (before payment) for the logged-in user.
    The `user` argument is provided by `token_required`.
    """
    order = Order.query.get(order_id)
    if not order or order.buyer_id != user.id:
        return jsonify({"error": "Order not found or not authorized"}), 404

    if order.status != "PENDING":
        return jsonify({"error": "Only pending orders can be canceled"}), 400

    order.status = "CANCELED"
    order.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "message": "Order canceled successfully.",
        "order_id": order.id,
        "status": order.status
    }), 200


# ------------------ Step 1: Create Order ------------------
@product_bp.route("product/orders/create", methods=["POST"])
@token_required
def create_order(user):
    """
    Buyer initiates a new order for a product.
    JSON: { "product_id": int, "quantity": int }
    """
    data = request.get_json()
    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 1))


    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    seller = User.query.get(product.seller_id)
    buyer = user  # ✅ Use user from token_required

    total_price = Decimal(product.price) * Decimal(quantity)

    # Seller 10× sales limit check
    seller_wallet = Wallet.query.filter_by(user_id=seller.id).first()
    if total_price > (Decimal(seller_wallet.block_balance) * 10):
        return jsonify({"error": "Seller exceeded 10× sales limit"}), 400

    order = Order(
        buyer_id=buyer.id,
        seller_id=seller.id,
        product_id=product.id,
        quantity=quantity,
        price=total_price,
        status="PENDING",
        created_at=datetime.utcnow()
    )
    db.session.add(order)
    db.session.commit()

    return jsonify({
        "message": "Order created successfully. Proceed to Paystack payment.",
        "order_id": order.id,
        "product": product.title,
        "seller_id": seller.id,
        "total_price": str(total_price),
        "status":  str(order.status) 
    }), 201


# ------------------ Step 2: Confirm Payment ------------------
@product_bp.route("product/orders/<int:order_id>/payment_confirmed", methods=["POST"])
@token_required
def payment_confirmed(order_id):
    """
    Webhook/client call after successful Paystack payment.
    JSON: { "payment_reference": str }
    """
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    if order.status != "PENDING":
        return jsonify({"error": "Order already paid or delivered"}), 400

    ref = request.json.get("payment_reference")
    order.status = "ESCROWED"
    order.payment_reference = ref
    order.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "message": "Payment confirmed and escrowed.",
        "order_id": order.id,
        "status": order.status
    }), 200


# ------------------ Step 3: Confirm Delivery ------------------
@product_bp.route("product/orders/<int:order_id>/confirm_delivery", methods=["POST"])
@token_required
def confirm_delivery(user, order_id):
    """
    Buyer confirms delivery.
    - Deducts 10% from seller’s block
    - Adds 20% to buyer (10% transferred + 10% mined)
    """
    buyer = user  # ✅ Use injected user from token_required

    order = Order.query.get(order_id)
    if not order or order.buyer_id != buyer.id:
        return jsonify({"error": "Invalid order"}), 404
    if order.status != "ESCROWED":
        return jsonify({"error": "Order not ready for delivery confirmation"}), 400

    amount = Decimal(order.total_price)
    reward = amount * Decimal("0.10")  # 10% transfer
    mined = amount * Decimal("0.10")   # 10% mined

    buyer_wallet = Wallet.query.filter_by(user_id=buyer.id).first()
    seller_wallet = Wallet.query.filter_by(user_id=order.seller_id).first()

    if seller_wallet.block_balance < reward:
        return jsonify({"error": "Seller lacks sufficient block balance"}), 400

    with db.session.begin():
        # Wallet updates
        seller_wallet.block_balance -= reward
        buyer_wallet.block_balance += (reward + mined)
        order.status = "COMPLETED"
        order.completed_at = datetime.utcnow()

        # Ledger entries
        db.session.add(BlockLedger(
            user_id=seller_wallet.user_id,
            change=-reward,
            balance_after=seller_wallet.block_balance,
            reason=f"Deduction for sale to buyer {buyer.id}"
        ))
        db.session.add(BlockLedger(
            user_id=buyer_wallet.user_id,
            change=reward + mined,
            balance_after=buyer_wallet.block_balance,
            reason=f"Reward for confirming delivery of product {order.product_id}"
        ))

        # Transaction entries
        db.session.add(Transaction(
            sender_id=seller_wallet.user_id,
            receiver_id=buyer_wallet.user_id,
            order_id=order.id,
            amount=reward,
            currency="BLOCK",
            tx_type="DELIVERY_REWARD",
            description=f"10% transferred from seller to buyer on order {order.id}"
        ))

        db.session.add(Transaction(
            sender_id=None,  # system-generated mining
            receiver_id=buyer_wallet.user_id,
            order_id=order.id,
            amount=mined,
            currency="BLOCK",
            tx_type="MINED_BLOCK",
            description=f"10% newly mined block reward for order {order.id}"
        ))

    return jsonify({
        "message": "Delivery confirmed and rewards distributed.",
        "buyer_bonus_block": str(reward + mined),
        "seller_block_deduction": str(reward),
        "order_status": "COMPLETED"
    }), 200





from flask import send_from_directory, current_app

@product_bp.route("/uploads/<filename>")
def serve_image(filename):
    UPLOAD_FOLDER = current_app.config.get("UPLOAD_FOLDER")
    return send_from_directory(UPLOAD_FOLDER, filename)


@product_bp.route('/delete_post/<int:id>', methods=['DELETE'])
@token_required
def delete_post(user, id):
    """
    Deletes a product post by its ID.
    Only the owner (user) can delete their own post.
    """
    post = Product.query.get_or_404(id)

    # Optional security: ensure the user owns the post

    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post deleted successfully!"}), 200

    




@product_bp.route('/delete_all_posts', methods=['GET','POST'])
@token_required
def delete_all_posts(user):


    # Delete all posts
    Product.query.delete()

    db.session.commit()
    return jsonify({"message": "Posts deleted successfully!"}), 200
