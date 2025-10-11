from datetime import datetime,  timedelta
from flask import render_template, flash, redirect, url_for, request, current_app
from flask_login import current_user, login_required
from app import db
from app.main import bp
from datetime import datetime, timezone
from collections import Counter

from flask_socketio import SocketIO, emit, join_room, leave_room

import os
from flask_socketio import join_room, leave_room

from flask import Flask, flash,  render_template, redirect, url_for, session, current_app, abort
from flask_sqlalchemy import SQLAlchemy
from wtforms import StringField, IntegerField, TextAreaField, HiddenField, SelectField
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

from app import create_app, db,socketio

import logging
# app.py
from flask import Flask, render_template, url_for, redirect, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_migrate import Migrate
from flask_moment import Moment


from app.models import  Product,User
import requests

from datetime import datetime, timedelta
from sqlalchemy import func, desc


@bp.route('/update_contact_info', methods=['POST'])
@login_required
def update_contact_info():
    try:
        # Expect JSON payload from React
        data = request.get_json()

        address = data.get('settingsAddress')
        phone_number = data.get('settingsPhoneNumber')
        email = data.get('settingsEmailAddress')

        # Validate input
        if not all([address, phone_number, email]):
            return jsonify({'success': False, 'message': 'All fields are required.'}), 400

        # Get the authenticated user
        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found.'}), 404

        # Update user info
        user.address = address
        user.phone_number = phone_number
        user.email = email
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Contact information updated successfully.',
            'user': {
                'address': user.address,
                'phone_number': user.phone_number,
                'email': user.email
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating contact info: {e}")
        return jsonify({'success': False, 'message': 'An error occurred while updating contact information.'}), 500
  