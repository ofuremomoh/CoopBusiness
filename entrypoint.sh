#!/bin/bash
set -e  # Exit script on first error

echo "🚀 Running database migrations..."
flask db stamp head
flask db migrate -m "Fixing migration issue"
flask db upgrade




echo "🔄 Resetting failed PostgreSQL transactions..."
psql $DATABASE_URL -c "ROLLBACK;" || echo "⚠️ No transaction to rollback"

echo "✅ Starting Flask application..."
exec gunicorn -w 4 -b 0.0.0.0:$PORT run:app
#!/bin/sh
gunicorn --workers=4 --threads=2 run:app

