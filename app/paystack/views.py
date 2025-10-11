from datetime import datetime
from flask import render_template, flash, redirect, \
    url_for, request, current_app
from flask_login import current_user, login_required, confirm_login
from app import db

import os

from flask import Flask, flash,  render_template, redirect, url_for, session, current_app, abort
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, TextAreaField, HiddenField, SelectField
from flask_wtf.file import FileField, FileAllowed
import os
from itsdangerous import URLSafeTimedSerializer
from base64 import b64encode
import base64
from io import BytesIO #Converts data from Database into bytes
from flask_migrate import Migrate
import uuid
# Built-in Imports
import os
import json, requests
from datetime import datetime
from base64 import b64encode
import base64
from io import BytesIO #Converts data from Database into bytes
from flask_bootstrap import Bootstrap
from flask_login import UserMixin
import random
from flask import render_template, abort, redirect, request
from random import randint
from flask_mail import Mail , Message
from wtforms.validators import DataRequired, Length, Email, Regexp, EqualTo
from wtforms import ValidationError
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, LoginManager, login_required, logout_user, current_user, login_user, AnonymousUserMixin
import functools
from random import randint
# Flask
from flask import Flask, render_template, request, flash, redirect, url_for, send_file # Converst bytes into a file for downloads

# FLask SQLAlchemy, Database
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField,  TextAreaField, SelectField, FileField, FloatField
from flask_wtf.file import FileField, FileAllowed, FileRequired, DataRequired
from sqlalchemy import create_engine
#from flask_mysqldb import MySQL
#import mysql.connector
from dateutil.relativedelta import relativedelta



#import smtplib
#import unittest
from flask_bootstrap import Bootstrap
import os
from flask import Flask, request, url_for, render_template, flash, redirect, Blueprint, make_response
from flask_mail import Mail, Message
#from itsdangerous import TimedJSONWebSignatureSerializer as Serializer, SignatureExpired
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField,  TextAreaField, SelectField
from wtforms.validators import DataRequired, Length, Email, Regexp, EqualTo, Optional
from wtforms import ValidationError
from flask import current_app, abort, jsonify
import bleach
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
#from threading import Thread
from flask import current_app, render_template
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, LoginManager, login_required, logout_user, current_user, login_user, AnonymousUserMixin
#from dotenv import load_dotenv
from flask_moment import Moment
from datetime import datetime
import functools
import hashlib

from flask_login import UserMixin, AnonymousUserMixin,  LoginManager,  login_user, logout_user, login_required, current_user
from sqlalchemy.dialects.postgresql import ARRAY
from flask import Flask, Blueprint, render_template, redirect, url_for, flash, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
import secrets
from werkzeug.security import generate_password_hash, check_password_hash
import os
import random
from random import shuffle
#from sqlalchemy.sql import text
from sqlalchemy import create_engine
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
#from flask_wtf.html5 import NumberInput
from wtforms import TextAreaField, PasswordField, SubmitField, StringField, IntegerField, SelectField, DateField
#from wtforms.fields.html5 import EmailField
from wtforms.validators import  Length, EqualTo, ValidationError, DataRequired, Email
from flask_bootstrap import Bootstrap
from flask_mail import Mail
import smtplib
import unittest
from flask_bootstrap import Bootstrap
import os
from flask import Flask, request, url_for, render_template, flash, redirect, Blueprint
from flask_mail import Mail, Message
#from itsdangerous import TimedJSONWebSignatureSerializer as Serializer, SignatureExpired
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Length, Email, Regexp, EqualTo
from wtforms import ValidationError
from flask import current_app
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
#from threading import Thread
from flask import current_app, render_template
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, LoginManager, login_required, logout_user, current_user, login_user, AnonymousUserMixin


import psycopg2 #pip install psycopg2 
import psycopg2.extras

from email.message import EmailMessage
import ssl 
import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask_dance.contrib.facebook import facebook
from flask_dance.contrib.google import google

from app.models  import User,Wallet,Transaction
from app import db
from app.paystack import bp as paystack_bp

from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from config import Config
from app.auth.views import token_required
import requests, hmac, hashlib, os

from dotenv import load_dotenv

load_dotenv()  # loads variables from .env file into environment

PAYSTACK_SECRET = os.getenv("PAYSTACK_SECRET")

# ===========================
# Home
# ===========================
@paystack_bp.route("/paystack_home")
@token_required
def paystack_home():
    users = Wallet.query.all()
    return render_template("paystack_home.html", users=users)

# ===========================
# Register user & create DVA
# ===========================
@paystack_bp.route('/create_main_account', methods=['GET', 'POST'])
@token_required
def create_main_account(user):

    wallet = Wallet.query.filter_by(user=user).first()
    if not user.first_name or not user.last_name:
        flash('Update your names')
        return redirect(url_for('main.settings'))
    if not user.phone:
        flash('Submit your phone number to create a bank account')
        return redirect(url_for('main.settings'))


    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET}",
        "Content-Type": "application/json"
    }

    # ---------------------------
    # STEP 1: Create Customer
    # ---------------------------
    customer_payload = {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": '+234'+ user.phone  # must be valid, required
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

    return jsonify({"Account successfully created!", "success"}), 200



def handle_collection_event(event_data):
    # Example: A user was credited

    # Update user's fiat_balance, store transaction etc.
    reference = event_data.get("reference")
    amount_received = float(event_data.get("amountReceived", 0))
    virtual_account_id = event_data.get("virtualAccount")
    description = event_data.get("description", "Deposit")
    customer_name = event_data.get("customerName", "Unknown")

    # Find the matching MainAccount
    account = Wallet.query.filter_by(provider_reference=virtual_account_id).first()

    if not account:
        return jsonify({"error": "Matching account not found"}), 404
    
    existing = Wallet.query.filter_by(reference=reference).first()
    if existing:
        return jsonify({"message": "Duplicate webhook - already credited"}), 200

    # Credit the account
    account.fiat_balance += amount_received

    # Create a transaction record
    txn = Transaction(
        tx_type='deposit',
        description=f"Deposit from {customer_name} - {description}",
        receiver_id=account.id,
        amount=amount_received,
        reference=reference,
        status="successful",
        narration="Webhook deposit"
    )

    db.session.add(txn)
    db.session.commit()


    return jsonify({"message": "Account credited successfully"}), 200


# ===========================
# Webhook (handle deposits & withdrawals)
# ===========================

'''
@paystack_bp.route("/webhook/paystack", methods=["POST"])
def paystack_webhook():
    payload = request.data
    signature = request.headers.get("x-paystack-signature")

    print(payload)



    # Verify signature
    expected = hmac.new(PAYSTACK_SECRET.encode(), payload, hashlib.sha512).hexdigest()
    if signature != expected:
        return jsonify({"error": "Invalid signature"}), 400

    event = request.json

    if event["event"] == "charge.success":
        data = event["data"]
        reference = data.get("reference") 
        email = data["customer"]["email"]
        amount = data["amount"] / 100
        sender_name = data["authorization"].get("sender_name")
        sender_bank = data["authorization"].get("sender_bank")


        user = MainAccount.query.filter_by(email=email).first()
        existing = MainTransaction.query.filter_by(reference=reference).first()
        if existing:
            return jsonify({"message": "Duplicate webhook - already credited"}), 200

        if user:
            user.fiat_balance += amount

            txn = MainTransaction(
                transaction_type='deposit',
                description=f"Deposit from {sender_name} - {sender_bank}",
                account_id=user.id,
                amount=amount,
                reference=reference,
                status="successful",
                narration="deposit"
            )

            db.session.add(txn)

            db.session.commit()

    elif event["event"] == "transfer.success":
        # Mark withdrawal as successful (optional logging)
        print('successful')

        pass

    elif event["event"] == "transfer.failed":
        print('unsuccessful')

        # Refund wallet (optional)
        pass

    return jsonify({"status": "ok"}), 200
'''

@paystack_bp.route("/webhook/paystack", methods=["POST"])
def paystack_webhook():
    payload = request.data
    signature = request.headers.get("x-paystack-signature")

    # Verify signature
    expected = hmac.new(PAYSTACK_SECRET.encode(), payload, hashlib.sha512).hexdigest()
    if signature != expected:
        return jsonify({"error": "Invalid signature"}), 400

    event = request.json

    # --------------------
    # Handle deposit
    # --------------------
    if event["event"] == "charge.success":
        data = event["data"]
        reference = data.get("reference")
        email = data["customer"]["email"]
        amount = data["amount"] / 100  # convert from kobo to naira
        sender_name = data["authorization"].get("sender_name")
        sender_bank = data["authorization"].get("sender_bank")

        user = Wallet.query.filter_by(email=email).first()
        existing = Transaction.query.filter_by(reference=reference).first()
        if existing:
            return jsonify({"message": "Duplicate webhook - already credited"}), 200

        if user:
            user.fiat_balance += amount

            txn = Transaction(
                tx_type='deposit',
                description=f"Deposit from {sender_name} - {sender_bank}",
                receiver_id=user.id,
                amount=amount,
                reference=reference,
                status="successful",
                narration="deposit"
            )

            db.session.add(txn)
            db.session.commit()

    # --------------------
    # Handle withdrawal success
    # --------------------
    elif event["event"] == "transfer.success":
        data = event["data"]
        reference = data.get("reference")

        withdrawal = Transaction.query.filter_by(reference=reference, tx_type="withdrawal").first()
        if withdrawal:
            withdrawal.status = "successful"
            withdrawal.description = f"Withdrawal successful to {data.get('recipient', {}).get('details', {}).get('bank_name', 'Bank')}"
            db.session.commit()

        print(f"Withdrawal {reference} marked successful.")

    # --------------------
    # Handle withdrawal failure
    # --------------------
    elif event["event"] == "transfer.failed":
        data = event["data"]
        reference = data.get("reference")
        amount = data.get("amount", 0) / 100

        withdrawal = Transaction.query.filter_by(reference=reference, tx_type="withdrawal").first()
        if withdrawal:
            withdrawal.status = "failed"

            # Refund wallet
            user = Wallet.query.get(withdrawal.account_id)
            if user:
                user.fiat_balance += amount

            db.session.commit()

        print(f"Withdrawal {reference} failed. Refunded {amount} to user.")

    return jsonify({"status": "ok"}), 200

# ===========================
# Wallet page
# ===========================


@paystack_bp.route("/wallet/<email>")
def wallet(email):
    user = User.query.filter_by(email=email).first_or_404()
    return render_template("wallet.html", user=user)


# app.py
from flask import Flask, request, render_template, jsonify
import requests
import os


PAYSTACK_BASE_URL = "https://api.paystack.co"

headers = {
    "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
    "Content-Type": "application/json"
}

# ---------- Fetch list of banks ----------

def get_transfer_balance():
    url = "https://api.paystack.co/balance/ledger"
    response = requests.get(url, headers=headers)
    data = response.json()

    balances = data.get("data", [])
    if not balances:
        return {
            "status": False,
            "message": "No transfer balance found. Please top up your transfer wallet."
        }

    return {
        "status": True,
        "balance": int(balances[0]["balance"]),  # in kobo
        "currency": balances[0]["currency"]
    }

from app.utils import has_exhausted_initial_blocks
# ✅ Withdraw route (GET: show form with banks, POST: process transfer)
@paystack_bp.route('/withdraw', methods=['GET', 'POST'])
@token_required
def withdraw(user):
    main_account = Wallet.query.filter_by(user_id=user.id).first()

    if not has_exhausted_initial_blocks(user):
        return jsonify({
            "error": (
                f"You must spend up to your initial allocation of "
                f"{wallet.initial_block_allocation:,.0f} blocks before withdrawals are enabled."
            )
        }), 403

    balance_data = get_transfer_balance()
    ledger_balances = balance_data.get("data", [])

    if not ledger_balances:
        return {
            "status": False,
            "message": "No transfer ledger found. Fund your Transfer Balance from the Paystack Dashboard."
        }

    ledger_balance = int(ledger_balances[0]["balance"])

    if request.method == 'GET':

        # Fetch banks for dropdown

        banks_url = "https://api.paystack.co/bank"
        response = requests.get(banks_url, headers=headers)
        banks = response.json().get("data", []) if response.ok else []
        return render_template("withdraw.html", banks=banks)

    if request.method == 'POST':
        bank_code = request.form['bank_code']
        account_number = request.form['account_number']
        amount = int(request.form['amount']) # Convert to kobo
        print(amount,'this is amount here!!!!!')
        password = request.form['password']
        if not user.verify_password(password):
            flash('incorrect password')
            return redirect(request.referrer)

        if not main_account.deposit_withdraw('withdraw', amount):
            flash('insufficient fund!!')
            return redirect(request.referrer)

        # 1. Resolve account number
        resolve_url = f"https://api.paystack.co/bank/resolve?account_number={account_number}&bank_code={bank_code}"
        resolve_resp = requests.get(resolve_url, headers=headers).json()
        if not resolve_resp.get("status"):
            flash("Account resolution failed. Try again.", "danger")
            return redirect(url_for("paystack.withdraw_page"))

        account_name = resolve_resp["data"]["account_name"]

        # 2. Create recipient
        recipient_url = "https://api.paystack.co/transferrecipient"
        recipient_payload = {
            "type": "nuban",
            "name": account_name,
            "account_number": account_number,
            "bank_code": bank_code,
            "currency": "NGN"
        }
        recipient_resp = requests.post(recipient_url, headers=headers, json=recipient_payload).json()
        if not recipient_resp.get("status"):
            flash("Recipient creation failed.", "danger")
            return redirect(url_for("paystack.withdraw_page"))

        recipient_code = recipient_resp["data"]["recipient_code"]

        # 3. Initiate transfer
        transfer_url = "https://api.paystack.co/transfer"
        transfer_payload = {
            "source": "balance",
            "amount": amount,
            "recipient": recipient_code,
            "reason": "Withdrawal from app"
        }
        transfer_resp = requests.post(transfer_url, headers=headers, json=transfer_payload).json()

        print(transfer_resp)

        if transfer_resp.get("status"):
            flash(f"Transfer successful to {account_name}!", "success")
            new_transaction = Transaction(
            tx_type='withdrawal',
            description= f"Transfer to {account_name}",
            receiver_id=main_account.id,
            amount=-1 * amount,

            )

            db.session.add(new_transaction)
            db.session.commit()
        else:
            flash("Transfer failed. Please try again.", "danger")

        return redirect(url_for("main.main_account"))





# ✅ AJAX: Verify account number (for live account name display)
@paystack_bp.route('/pay', methods=['GET', 'POST'])
@token_required
def pay(user):
    main_account = Wallet.query.filter_by(user_id=user.id).first()

    if not has_exhausted_initial_blocks(user):
        return jsonify({
            "error": (
                f"You must spend up to your initial allocation of "
                f"{wallet.initial_block_allocation:,.0f} blocks before withdrawals are enabled."
            )
        }), 403

    balance_data = get_transfer_balance()
    ledger_balances = balance_data.get("data", [])

    if not ledger_balances:
        return {
            "status": False,
            "message": "No transfer ledger found. Fund your Transfer Balance from the Paystack Dashboard."
        }

    ledger_balance = int(ledger_balances[0]["balance"])

    if request.method == 'GET':

        # Fetch banks for dropdown

        banks_url = "https://api.paystack.co/bank"
        response = requests.get(banks_url, headers=headers)
        banks = response.json().get("data", []) if response.ok else []
        return render_template("withdraw.html", banks=banks)

    if request.method == 'POST':
        bank_code = request.form['bank_code']
        account_number = request.form['account_number']
        amount = int(request.form['amount']) # Convert to kobo
        print(amount,'this is amount here!!!!!')
        password = request.form['password']
        if not user.verify_password(password):
            flash('incorrect password')
            return redirect(request.referrer)

        if not main_account.deposit_withdraw('withdraw', amount):
            flash('insufficient fund!!')
            return redirect(request.referrer)

        # 1. Resolve account number
        resolve_url = f"https://api.paystack.co/bank/resolve?account_number={account_number}&bank_code={bank_code}"
        resolve_resp = requests.get(resolve_url, headers=headers).json()
        if not resolve_resp.get("status"):
            flash("Account resolution failed. Try again.", "danger")
            return redirect(url_for("paystack.withdraw_page"))

        account_name = resolve_resp["data"]["account_name"]

        # 2. Create recipient
        recipient_url = "https://api.paystack.co/transferrecipient"
        recipient_payload = {
            "type": "nuban",
            "name": account_name,
            "account_number": account_number,
            "bank_code": bank_code,
            "currency": "NGN"
        }
        recipient_resp = requests.post(recipient_url, headers=headers, json=recipient_payload).json()
        if not recipient_resp.get("status"):
            flash("Recipient creation failed.", "danger")
            return redirect(url_for("paystack.withdraw_page"))

        recipient_code = recipient_resp["data"]["recipient_code"]

        # 3. Initiate transfer
        transfer_url = "https://api.paystack.co/transfer"
        transfer_payload = {
            "source": "balance",
            "amount": amount,
            "recipient": recipient_code,
            "reason": "Withdrawal from app"
        }
        transfer_resp = requests.post(transfer_url, headers=headers, json=transfer_payload).json()

        print(transfer_resp)

        if transfer_resp.get("status"):
            flash(f"Transfer successful to {account_name}!", "success")
            new_transaction = Transaction(
            tx_type='withdrawal',
            description= f"Transfer to {account_name}",
            receiver_id=main_account.id,
            amount=-1 * amount,

            )

            db.session.add(new_transaction)
            db.session.commit()
        else:
            flash("Transfer failed. Please try again.", "danger")

        return redirect(url_for("main.main_account"))





@paystack_bp.route('/verify_account', methods=['POST'])
def verify_account():
    data = request.get_json()
    account_number = data.get("account_number")
    bank_code = data.get("bank_code")

    url = f"https://api.paystack.co/bank/resolve?account_number={account_number}&bank_code={bank_code}"
    resp = requests.get(url, headers=headers).json()

    if resp.get("status"):
        return jsonify({"success": True, "account_name": resp["data"]["account_name"]})
    return jsonify({"success": False, "message": resp.get("message", "Unable to resolve account")})


@paystack_bp.route('/withdraw_page', methods=['GET'])
@token_required
def withdraw_page():
    banks_url = "https://api.paystack.co/bank"
    response = requests.get(banks_url, headers=headers)
    banks = response.json().get("data", []) if response.ok else []
    return render_template("withdraw.html", banks=banks)


@paystack_bp.route('/paystack/banks', methods=['GET'])
@token_required
def banks(user):
    try:
        banks_url = "https://api.paystack.co/bank"
        response = requests.get(banks_url, headers=headers)

        if response.ok:
            banks = response.json().get("data", [])
            return jsonify({
                "success": True,
                "banks": banks
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Failed to fetch banks from Paystack."
            }), response.status_code

    except Exception as e:
        print(f"Error fetching Paystack banks: {e}")
        return jsonify({
            "success": False,
            "message": "An error occurred while fetching banks."
        }), 500
