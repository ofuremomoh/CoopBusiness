# app/models.py
from datetime import datetime
from decimal import Decimal
import enum

from app import login

from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

# ----------------------------
# Enums



class ListingStatus(enum.Enum):
    OPEN = "open"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ----------------------------
# Core models
# ----------------------------
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=True)
    phone = db.Column(db.String(32), unique=True, nullable=False)
    bvn = db.Column(db.String(32), unique=True, nullable=True)
    nin = db.Column(db.String(32), unique=True, nullable=True)
    user_type = db.Column(db.String(32), nullable=False, default="individual")  # individual | venture | company
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # relationships
    wallet = db.relationship("Wallet", uselist=False, back_populates="user")
    products = db.relationship("Product", back_populates="seller")
    orders_bought = db.relationship("Order", foreign_keys="Order.buyer_id", back_populates="buyer")
    orders_sold = db.relationship("Order", foreign_keys="Order.seller_id", back_populates="seller")
    listings = db.relationship("BlockSellListing", back_populates="seller")
    password = db.Column(db.String(255), nullable=False)  

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Wallet(db.Model):
    """
    Holds fiat and block balances for a user.
    Prefer using the helper methods (withdraw/deposit) inside a db.session.begin() transaction
    in services so operations remain atomic across multiple model updates.
    """
    __tablename__ = "wallets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    block_balance = db.Column(db.Numeric(18, 2), nullable=False, default=Decimal("0.00"))
    fiat_balance = db.Column(db.Numeric(18, 2), nullable=False, default=Decimal("0.00"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    paystack_customer_code = db.Column(db.String(50))
    paystack_dedicated_account = db.Column(db.String(50))
    paystack_bank_name = db.Column(db.String(50))
    initial_block_allocation = db.Column(db.Float, default=0.0)

    user = db.relationship("User", back_populates="wallet")

    # NOTE: These helper methods DO NOT commit the session — callers should commit/rollback.
    def deposit_blocks(self, amount: Decimal):
        """Add blocks to wallet and create ledger entry (caller must commit)."""
        self.block_balance = Decimal(self.block_balance) + Decimal(amount)
        db.session.add(self)
        # ledger entry should be created by service: BlockLedger(user_id=self.user_id, change=amount,...)

    def withdraw_blocks(self, amount: Decimal):
        """Withdraw blocks; raises ValueError if insufficient."""
        if Decimal(self.block_balance) < Decimal(amount):
            raise ValueError("Insufficient block balance")
        self.block_balance = Decimal(self.block_balance) - Decimal(amount)
        db.session.add(self)

    def deposit_fiat(self, amount: Decimal):
        self.fiat_balance = Decimal(self.fiat_balance) + Decimal(amount)
        db.session.add(self)

    def withdraw_fiat(self, amount: Decimal):
        if Decimal(self.fiat_balance) < Decimal(amount):
            raise ValueError("Insufficient fiat balance")
        self.fiat_balance = Decimal(self.fiat_balance) - Decimal(amount)
        db.session.add(self)


class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False, unique=True)
    parent_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True)
    children = db.relationship("Category", backref=db.backref('parent', remote_side=[id]))

class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=True)
    amount = db.Column(db.Numeric(precision=18, scale=2), nullable=False)
    currency = db.Column(db.String(10), default="BLOCK")  # BLOCK or NGN
    tx_type = db.Column(db.String(50))  # e.g. PURCHASE, DELIVERY_REWARD, MINING, BLOCK_SALE, ADMIN_FEE
    status = db.Column(db.String(20), default="SUCCESS")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.String(255))
    narration = db.Column(db.String(255))
    reference = db.Column(db.String(100), unique=True,nullable=True)

class Product(db.Model):
    """
    Physical or digital goods/services listed by a seller.
    Product sale flow is separate from block listing/exchange.
    """
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(18, 2), nullable=False)   # price in naira
    currency = db.Column(db.String(8), default="NGN")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    subcategory = db.Column(db.String(1000))
    image_url = db.Column(db.String(1000))
    seller = db.relationship("User", back_populates="products")
    category = db.Column(db.String(1000))


class Order(db.Model):
    """
    Product purchase order. This represents a purchase flow:
      - buyer initiates and paystack funds escrow for seller
      - status flows: PENDING -> ESCROWED -> DELIVERED -> COMPLETED
      - on COMPLETED: block transfers & minting happen
    """
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    price = db.Column(db.Numeric(18, 2), nullable=False)     # final paid price (naira)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    status = db.Column(db.String(255), nullable=False, default='PENDING')
    paystack_reference = db.Column(db.String(255), nullable=True)
    escrow_account = db.Column(db.String(255), nullable=True)  # your escrow record id if applicable
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    delivered_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    cancelled_at = db.Column(db.DateTime, nullable=True)

    buyer = db.relationship("User", foreign_keys=[buyer_id], back_populates="orders_bought")
    seller = db.relationship("User", foreign_keys=[seller_id], back_populates="orders_sold")
    product = db.relationship("Product")




class BlockLedger(db.Model):
    """
    Immutable log of block movements (mined, transfers, initial allocations, marketplace trades).
    Use this to reconcile total block supply.
    """
    __tablename__ = "block_ledger"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    change = db.Column(db.Numeric(18, 2), nullable=False)      # positive or negative
    balance_after = db.Column(db.Numeric(18, 2), nullable=False)
    reason = db.Column(db.String(255), nullable=True)
    reference = db.Column(db.String(255), nullable=True)       # optional external refs (order_id, tx_id)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class BlockSellListing(db.Model):
    """
    Seller offers `block_amount` blocks for sale at `price_per_block` (naira).
    This is the in-house exchange listing model (seller -> buyer).
    """
    __tablename__ = "block_sell_listings"

    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    block_amount = db.Column(db.Numeric(18, 2), nullable=False)
    price_per_block = db.Column(db.Numeric(18, 4), nullable=False)  # allow finer granularity
    fiat_total = db.Column(db.Numeric(18, 2), nullable=False)      # computed = block_amount * price_per_block
    status = db.Column(db.Enum(ListingStatus), default=ListingStatus.OPEN, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)

    seller = db.relationship("User", back_populates="listings")

# -----------------------------
# -----------------------------
# ExchangeListing Model
# -----------------------------
class ExchangeListing(db.Model):
    __tablename__ = "exchange_listings"

    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    block_amount = db.Column(db.Numeric(18, 2), nullable=False)
    rate_per_block = db.Column(db.Numeric(18, 2), nullable=False)  # e.g., ₦5 per block
    min_purchase = db.Column(db.Numeric(18, 2), default=0)
    max_purchase = db.Column(db.Numeric(18, 2), default=0)
    status = db.Column(db.String(20), default="ACTIVE")  # ACTIVE, COMPLETED, CANCELLED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    seller = db.relationship("User", backref="exchange_listings")

    def to_dict(self):
        return {
            "id": self.id,
            "seller_id": self.seller_id,
            "block_amount": str(self.block_amount),
            "rate_per_block": str(self.rate_per_block),
            "min_purchase": str(self.min_purchase),
            "max_purchase": str(self.max_purchase),
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Recipient of the notification
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Who triggered the notification
    type = db.Column(db.String(50), nullable=False)  # 'follow', 'like', 'comment', etc.
    content = db.Column(db.String(255), nullable=True)  # Optional message/content
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    sender = db.relationship('User', foreign_keys=[sender_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'sender_id': self.sender_id,
            'type': self.type,
            'content': self.content,
            'is_read': self.is_read,
            'sender_image': self.sender.rendered_data,
            'sender_gravatar': self.sender.gravatar(),
            'timestamp': self.timestamp.isoformat(),
            'sender': self.sender
        }


# -----------------------------
# ExchangeTx Model (already mentioned before)
# -----------------------------
class ExchangeTx(db.Model):
    __tablename__ = "exchange_transactions"

    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey("exchange_listings.id"), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    fiat_value = db.Column(db.Numeric(18, 2), nullable=False)
    block_value = db.Column(db.Numeric(18, 2), nullable=False)
    admin_fee = db.Column(db.Numeric(18, 2), nullable=False)
    status = db.Column(db.String(20), default="PENDING")  # PENDING, COMPLETED, CANCELLED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    buyer = db.relationship("User", foreign_keys=[buyer_id])
    seller = db.relationship("User", foreign_keys=[seller_id])
    listing = db.relationship("ExchangeListing", backref="transactions")

    def to_dict(self):
        return {
            "id": self.id,
            "listing_id": self.listing_id,
            "buyer_id": self.buyer_id,
            "seller_id": self.seller_id,
            "fiat_value": str(self.fiat_value),
            "block_value": str(self.block_value),
            "admin_fee": str(self.admin_fee),
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }

class PlatformAccount(db.Model):
    """
    Holds fiat collected as platform/admin fee. Helps reconcile fiat fees.
    """
    __tablename__ = "platform_account"

    id = db.Column(db.Integer, primary_key=True)
    fiat_balance = db.Column(db.Numeric(18, 2), default=Decimal("0.00"))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

class Referral(db.Model):
    __tablename__ = "referrals"

    id = db.Column(db.Integer, primary_key=True)
    referrer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    referred_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    referral_code = db.Column(db.String(12), nullable=False)
    bonus_amount = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    referrer = db.relationship("User", foreign_keys=[referrer_id], backref="referrals_made")
    referred = db.relationship("User", foreign_keys=[referred_id], backref="referral_received")

    def __repr__(self):
        return f"<Referral {self.referrer_id} → {self.referred_id} ({self.bonus_amount})>"
