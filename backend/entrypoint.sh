#!/bin/sh
set -e

# Simple wait-and-retry for database migrations
RETRIES=12
SLEEP=5
COUNT=0

echo "Waiting for database and running migrations..."
until python manage.py migrate --noinput; do
  COUNT=$((COUNT+1))
  if [ $COUNT -ge $RETRIES ]; then
    echo "Migrations failed after $RETRIES attempts"
    exit 1
  fi
  echo "Migration attempt $COUNT failed - retrying in ${SLEEP}s..."
  sleep $SLEEP
done

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the application
echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:8000 lms_backend.wsgi:application
