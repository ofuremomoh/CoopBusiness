import os
from datetime import  timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))



#UPLOAD_FOLDER = 'C:/Users/DELL/Documents/My Dev Files/Co/demo'  # Must match the disk mount path
#UPLOAD_FOLDER = 'C:/Users/DELL/Documents/My Dev Files/cobiz/uploads' 
UPLOAD_FOLDER = "/data/business_assets"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

USER_FOLDER = 'user_folder'


UPLOAD_THUMBNAIL_FOLDER = 'User_thumbnail'
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_pre_ping': True,
    'pool_recycle': 1800,  # Reconnect after 30 min
    'pool_timeout': 10
}

from dotenv import load_dotenv

load_dotenv()  # loads variables from .env file into environment

SECRET_KEY = os.getenv("PAYSTACK_SECRET")

class Config:
    # Core App Settings
    SECRET_KEY = SECRET_KEY
    
    SQLALCHEMY_DATABASE_URI = "postgresql://coop_business_user:b0btndMgU8Ji8p6bcAT3aryrzkf2kO4e@dpg-d3l5h5qdbo4c73ek27m0-a.oregon-postgres.render.com/coop_business"
    #SQLALCHEMY_DATABASE_URI = "postgresql://postgres:YardCore94!@localhost:5432/cobiz"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Pagination
    POSTS_PER_PAGE = 31
    FOLLOWED_PER_PAGE = 5
    FOLLOWERS_PER_PAGE = 5

    # Mail Configuration
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')

    MAIL_PORT = int(os.environ.get('MAIL_PORT', 465))

    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'false').lower() == 'true'

    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'true').lower() == 'true'
    
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL')
    FLASKY_MODERATOR = os.environ.get('FLASKY_MODERATOR')

    # Notification Emails
    FLASKER = 'theofuremomoh@outlook.com,momohofure@gmail.com,info.starturn@gmail.com,phurell1@mailto.plus'

    # Pusher Config


    # Twilio Config


    # File media_files
    UPLOAD_FOLDER = UPLOAD_FOLDER
    UPLOAD_USER_FOLDER = USER_FOLDER
    UPLOAD_THUMBNAIL_FOLDER = UPLOAD_THUMBNAIL_FOLDER


    # Session Config
    SESSION_TYPE = 'filesystem'
    #SESSION_SQLALCHEMY = None  # To be assigned in create_app after db.init_app
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    
    SESSION_KEY_PREFIX = 'session:'
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = 'NONE'
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_REFRESH_EACH_REQUEST = True
    SQLALCHEMY_ENGINE_OPTIONS = SQLALCHEMY_ENGINE_OPTIONS
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    SESSION_REFRESH_EACH_REQUEST = True

    #rediss://red-d3itt23e5dus739dbk5g:NQp0PYWLfIN7gKgNxI5RHebLDrFAafgu@oregon-keyvalue.render.com:6379/0?ssl_cert_reqs=CERT_NONE
    #redis://red-d3itt23e5dus739dbk5g:6379/0