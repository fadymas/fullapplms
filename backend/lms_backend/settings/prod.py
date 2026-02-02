"""
Production settings for LMS Backend.
Security-focused configuration.
"""
from .base import *
import os

# SECURITY FIX: Validate SECRET_KEY in production
if SECRET_KEY == 'django-insecure-key-change-in-production':
    raise ValueError(
        "CRITICAL SECURITY ERROR: SECRET_KEY must be set to a secure random value in production. "
        "Set the SECRET_KEY environment variable to a cryptographically secure random string."
    )

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = ['*']

# CORS - OPEN EVERYTHING
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://72.62.232.8,http://admin.mohamedghanem.cloud,http://student.mohamedghanem.cloud'
).split(',')

# Security settings - DISABLED FOR NOW
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
SECURE_BROWSER_XSS_FILTER = False
SECURE_CONTENT_TYPE_NOSNIFF = False
X_FRAME_OPTIONS = 'ALLOWALL'

# Password hashing
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
]

# Database connection pooling (if using pgBouncer or similar)
DATABASES['default']['CONN_MAX_AGE'] = 600

# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@lms.com')

# Logging - less verbose in production
LOGGING['root']['level'] = 'WARNING'
for logger in LOGGING['loggers'].values():
    logger['level'] = 'INFO'

# Logs directory already created in base.py

