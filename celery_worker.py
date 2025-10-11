# celery_worker.py
from app import create_app, celery

app = create_app()

# Make sure Celery is initialized with the app context
with app.app_context():
    pass  # ensures any Flask context-dependent things are loaded
