# app/routes/auth_routes.py
from flask import Blueprint, request, jsonify,flash,redirect,url_for
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import requests
import jwt
from functools import wraps

from app.models import db, User, Wallet, BlockLedger
from decimal import Decimal
import os
import traceback

from dotenv import load_dotenv

auth_bp = Blueprint("auth", __name__)
load_dotenv()  # loads variables from .env file into environment

PAYSTACK_SECRET = os.getenv("PAYSTACK_SECRET")

# Secret key (should come from environment variable)
SECRET_KEY = os.getenv("SECRET_KEY")

# --------------------------
# JWT helpers
# --------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token is missing"}), 401

        # ✅ Handle "Bearer " prefix
        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user = User.query.get(data["id"])
            print("🔑 Token received:", token)
            print("🧩 SECRET_KEY:", SECRET_KEY)

            if not user:
                return jsonify({"error": "User not found"}), 401
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401
        return f(user, *args, **kwargs)
    return decorated


def create_a_main_account(user):

    wallet = Wallet.query.filter_by(user=user).first()

    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET}",
        "Content-Type": "application/json"

    }

    full_name = user.name.strip()
    name_parts = full_name.split()

    first_name = name_parts[0] if len(name_parts) > 0 else ""
    last_name = name_parts[-1] if len(name_parts) > 1 else ""


    # ---------------------------
    # STEP 1: Create Customer
    # ---------------------------
    customer_payload = {
        "email": user.email,
        "first_name": first_name,
        "last_name": last_name,
        "phone": '+234'+ user.phone # must be valid, required
    }

    r = requests.post("https://api.paystack.co/customer", headers=headers, json=customer_payload)
    customer_data = r.json()
    print("CUSTOMER RESPONSE:", customer_data)

    if not customer_data.get("status"):
        return jsonify({"error": customer_data.get("message")}), 400

    customer_code = customer_data["data"]["customer_code"]

    # ---------------------------
    # STEP 2: Create Dedicated Virtual Account
    # ---------------------------
    dedicated_payload = {
        "customer": customer_code,
        "phone": '+234'+ user.phone,
        "preferred_bank": "wema-bank",   # or "titan-paystack"
        "country": "NG"
    }

    r = requests.post("https://api.paystack.co/dedicated_account", headers=headers, json=dedicated_payload)
    resp = r.json()
    print("DEDICATED RESPONSE:", resp)

    if not resp.get("status"):
        return jsonify(resp), 400

    acct_data = resp["data"]  # <-- contains all dedicated account info

    # ---------------------------
    # STEP 3: Save to DB
    # ---------------------------

    wallet.paystack_customer_code=customer_code,
    wallet.paystack_dedicated_account=acct_data["account_number"],
    wallet.paystack_bank_name=acct_data["bank"]["name"]
    db.session.commit()

    return jsonify("Account successfully created!", "success")




@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user.
    Body: {name, phone, password, user_type}
    On success:
      - Creates user & wallet
      - Allocates 100,000 initial Block Amount
      - Creates ledger entry
    """
    data = request.get_json() or {}
    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")
    password = data.get("password")
    user_type = data.get("user_type", "individual")

    if not all([name, phone, password]):
        return jsonify({"error": "Missing required fields"}), 400

    # Prevent duplicate registration
    if User.query.filter_by(phone=phone).first():
        return jsonify({"error": "Phone already registered"}), 400

    # ✅ Hash password
    hashed_pw = generate_password_hash(password)

    try:
        # Create user
        user = User(
            name=name,
            phone=phone,
            email=email,
            password=hashed_pw,
            user_type=user_type
        )
        db.session.add(user)
        db.session.flush()  # to get user.id


        # Create wallet
        wallet = Wallet(user_id=user.id, block_balance=Decimal("100000.00"))
        db.session.add(wallet)

        # Create ledger entry
        ledger = BlockLedger(
            user_id=user.id,
            change=Decimal("100000.00"),
            balance_after=Decimal("100000.00"),
            reason="Initial allocation"
        )
        db.session.add(ledger)

        try:
            create_a_main_account(user)
         
        except Exception as e:
            return jsonify({"error": f"Can't create account number right now {str(e)}"}), 401


        db.session.commit()
        

        return jsonify({
            "message": "Registration successful",
            "user_id": user.id
        }), 201

    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({"error": "Registration failed", "details": str(e)}), 500


# -----------------------------
# LOGIN
# -----------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login user and return JWT token.
    Body: {phone, password}
    """
    data = request.get_json() or {}
    phone = data.get("phone")
    password = data.get("password")

    if not all([phone, password]):
        return jsonify({"error": "Phone and password are required"}), 400

    user = User.query.filter_by(phone=phone).first()
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # ✅ Check password hash properly
    if not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # ✅ Create token
    token = jwt.encode(
        {"id": user.id, "exp": datetime.utcnow() + timedelta(hours=12)},
        SECRET_KEY,
        algorithm="HS256"
    )

    wallet = user.wallet
    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "user_type": user.user_type,
            "block_balance": str(wallet.block_balance if wallet else 0),
            "fiat_balance": str(wallet.fiat_balance if wallet else 0),
        }
    }), 200





@auth_bp.route("/verify_token", methods=["GET"])
@token_required
def verify_token(user):
    """Verify and return basic user info"""
    wallet = user.wallet
    return jsonify({
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "block_balance": str(wallet.block_balance),
        "fiat_balance": str(wallet.fiat_balance),
    })

