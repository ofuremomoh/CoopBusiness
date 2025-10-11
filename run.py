from app import create_app, socketio,db,celery
import os
import random
import base64
import requests

from werkzeug.security import generate_password_hash
from flask_login import current_user

app = create_app()

import hashlib



from flask_migrate import upgrade
from sqlalchemy.exc import OperationalError

def run_migrations():
    try:
        
        upgrade()
        print("✅ Database migration successful!")
    except OperationalError:
        print("⚠️ Database migration failed!")

def increase_balance():
    current_user.coins =+ 10000
    db.session.commit()




if __name__ == "__main__":
    #assign_referral_codes()
    #batch_convert_existing_mp4()
    with app.app_context():
        
        #populate_webm_file_names()
        # Ensure protected directory exists
        os.makedirs(app.config['PROTECTED_FILES_DIR'], exist_ok=True)
        
      # Get port from environment variable
    app.run(debug=True)


