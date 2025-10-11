from flask import Blueprint

bp = Blueprint('paystack', __name__)

from app.paystack import views