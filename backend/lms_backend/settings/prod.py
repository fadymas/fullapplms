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

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='student.mohamedghanem.cloud,mohamedghanem.cloud'
).split(',')

# CORS - Restrict to specific origins in production
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='',
    cast=lambda v: [s.strip() for s in v.split(',') if s.strip()]
)

# Security settings - STRICT for production
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Password hashing - Use Argon2 in production
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
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

