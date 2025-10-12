from flask import Flask, flash
from flask_migrate import Migrate
from flask_mail import Mail
from flask_login import LoginManager
from flask_moment import Moment
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from werkzeug.middleware.proxy_fix import ProxyFix
import os
from flask import Flask, request, redirect, send_from_directory

from config import Config
from flask_dance.contrib.google import make_google_blueprint
from flask_dance.contrib.facebook import make_facebook_blueprint
from flask_dance.consumer.storage import MemoryStorage

from flask_dance.consumer.storage.sqla import SQLAlchemyStorage
from flask_login import current_user,login_user
from .extensions import db, login  # ✅ use from extensions

from flask_dance.consumer import oauth_authorized
from werkzeug.exceptions import RequestEntityTooLarge

from flask_session import Session

from flask_wtf.csrf import CSRFProtect



import logging 

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta


jwt = JWTManager()

migrate = Migrate()
mail = Mail()
moment = Moment()
socketio = SocketIO()

csrf = CSRFProtect()

login.login_view = '/login'


#logging.basicConfig(level=logging.DEBUG)


MAX_FILE_SIZE = 100 * 1024 * 1024  # 50 MB



SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_pre_ping': True,
    'pool_recycle': 1800,  # Reconnect after 30 min
    'pool_timeout': 10

}

#UPLOAD_FOLDER = 'C:/Users/DELL/Documents/My Dev Files/cobiz/uploads' 

UPLOAD_FOLDER = "/data/business_assets"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

USER_FOLDER='user_folder'


from celery import Celery


celery = Celery(__name__) 

import os, random, string, subprocess, uuid

def convert_to_webm(input_file, upload_folder):
    """Convert MP4 to WebM and return the new file path."""
    if not input_file.endswith(".mp4"):
        return input_file  # no conversion needed

    # Create a unique name for output file
    base_name = os.path.splitext(os.path.basename(input_file))[0]
    unique_name = f"{base_name}_{uuid.uuid4().hex[:8]}.webm"
    output_file = os.path.join(upload_folder, unique_name)

    # Run ffmpeg conversion
    cmd = [
        "ffmpeg",
        "-i", input_file,
        "-c:v", "libvpx-vp9",
        "-b:v", "1M",
        "-c:a", "libopus",
        output_file
    ]

    try:
        subprocess.run(cmd, check=True)
        print(f"✅ Converted {input_file} -> {output_file}")

        # Optional: delete old MP4
        if os.path.exists(input_file):
            os.remove(input_file)

        return output_file
    except subprocess.CalledProcessError as e:
        print(f"❌ Conversion failed: {e}")
        return input_file  # fallback to original


import sys



from flask_cors import CORS

from flask_dance.consumer.requests import OAuth2Session

# Override the session used by Flask-Dance to set timeouts
class TimeoutOAuth2Session(OAuth2Session):
    def request(self, method, url, **kwargs):
        kwargs.setdefault("timeout", 10)  # 10 seconds timeout
        return super().request(method, url, **kwargs)



class TimeoutOAuth2Session(OAuth2Session):
    def request(self, method, url, **kwargs):
        kwargs.setdefault("timeout", 10)  # Set a 10-second timeout
        return super().request(method, url, **kwargs)

from flask_dance.consumer import oauth_authorized

def create_app(config_class=Config):
    app = Flask(__name__, static_folder="front-end")

    app.config.from_object(config_class)

    #CORS(app, resources={r"/*": {"origins": ["*", "http://localhost:8080/", "http://127.0.0.1:5000",]}}, supports_credentials=True)
    #CORS(app, supports_credentials=True)
    CORS(app, origins=["http://localhost:8080"], supports_credentials=True)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)



    # API routes here
    # app.register_blueprint(auth_bp, url_prefix="/api")

    # ---------------------------
    # Serve React App (frontend)
    # ---------------------------

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        """
        Catch-all route: Serve React index.html for all frontend routes.
        Serves static files if they exist; otherwise serves index.html.
        """
        # Protect API routes
        if path.startswith("api"):
            return jsonify({"error": "Invalid API path"}), 404

        # Serve static files if they exist
        file_path = os.path.join(app.static_folder, path)
        if path != "" and os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)

        # Otherwise serve index.html
        return send_from_directory(app.static_folder, "index.html")





    app.config['WTF_CSRF_ENABLED'] = False  

    from flask_wtf.csrf import generate_csrf

    @app.context_processor
    def inject_csrf_token():
        return dict(csrf_token=generate_csrf())

    # Initialize extensions
    # 1. Initialize other extensions
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    login.init_app(app)
    moment.init_app(app)
    csrf.init_app(app) 
    socketio.init_app(app, cors_allowed_origins="*")

    

    from flask import session, request

    @app.errorhandler(413)
    @app.errorhandler(RequestEntityTooLarge)
    def app_handle_413(e):
        flash("File too big, max of 50MB for this file")
        return redirect(url_for('main.post_rewards'))
    

    
    @app.before_request
    def log_all_requests():
        print("🛰️  Incoming:", request.path)

    
    @app.before_request
    def before_request():
        if not request.is_secure and not app.debug:
            return redirect(request.url.replace("http://", "https://"))
    #app.config["OAUTHLIB_INSECURE_TRANSPORT"] = True  # for localhost testing only
    

    # 2. Set session config BEFORE calling session.init_app(app)

    #app.config['SESSION_SQLALCHEMY'] = db
    
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_KEY_PREFIX'] = 'session:'
    app.config['SECURITY_PASSWORD_SALT'] = 'lover'
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0



    app.config['PROTECTED_FILES_DIR'] = os.path.abspath('./protected_files')
    app.config['DOWNLOAD_TTL_SECONDS'] = 16 * 3600  # 24h link


    jwt.init_app(app)

    # ------------------- BLUEPRINT REGISTRATION -------------------

    

    session_dir = os.path.join(app.root_path, 'flask_session')
    if not os.path.exists(session_dir):
        os.makedirs(session_dir)
    app.config['SESSION_FILE_DIR'] = session_dir

    if not os.access(session_dir, os.W_OK):
        print(f"❌ Session directory {session_dir} is not writable!")

    Session(app)


    for view_func in app.view_functions:
        csrf.exempt(view_func)



    

        # Setup Google OAuth

    # 3. Now initialize Flask-Session
    

    # Make upload folders if they don't exist

    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    if not os.path.exists(app.config['UPLOAD_USER_FOLDER']):
        os.makedirs(app.config['UPLOAD_USER_FOLDER'])

    # Blueprints


    from app.product.views import product_bp
    from app.wallet.views import wallet_bp  # includes referral logic
    from app.admin.views import admin_bp
    from app.exchange.views import exchange_bp
    from app.ledger.views import ledger_bp
    from app.auth.views import auth_bp

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found", "message": str(e)}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Server error", "message": str(e)}), 500


    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(product_bp, url_prefix="/api")
    app.register_blueprint(exchange_bp, url_prefix="/api")
    app.register_blueprint(wallet_bp, url_prefix="/api")
    app.register_blueprint(ledger_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")

    from app.paystack import bp as paystack_bp
    app.register_blueprint(paystack_bp, url_prefix="/api")

    from app.main import bp as main_bp
    app.register_blueprint(main_bp)


    return app



