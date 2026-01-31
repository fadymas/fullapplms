"""
DEPRECATED: This file is kept for backward compatibility.
Please update your Django settings to use lms_backend.settings instead.

The new settings structure is in lms_backend/settings/:
- base.py - Shared settings
- dev.py - Development settings  
- prod.py - Production settings

To use the new settings, update your manage.py and wsgi.py to:
  os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')

And set DJANGO_ENV environment variable to 'dev' or 'prod'.
"""
# For now, keep old settings for compatibility
# TODO: Migrate to new settings structure
import os
from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-key-change-in-production')

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# ==================== INSTALLED APPS ====================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'django_extensions',
    'import_export',
    'drf_yasg',
    
    # Local apps
    'users',
    'courses',
    'payments',
    'quizzes',
    
    # New apps for payment system
    'notifications',
    'dashboard',
    'reports',

    'drf_yasg',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'lms_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'lms_backend.wsgi.application'

# ==================== DATABASE ====================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='lms_db'),
        'USER': config('DB_USER', default='lms_user'),
        'PASSWORD': config('DB_PASSWORD', default='password'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# ==================== PASSWORD VALIDATION ====================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ==================== INTERNATIONALIZATION ====================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ==================== STATIC & MEDIA FILES ====================

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ==================== DEFAULT PRIMARY KEY ====================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================== REST FRAMEWORK SETTINGS ====================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '5000/day',
    },
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'utils.renderers.DecimalJSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}

REST_AUTH_THROTTLE_RATES = {
    'login': '10/minute',
    'register': '5/hour',
}

# ==================== JWT SETTINGS ====================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(days=1),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=7),
}

# ==================== CORS SETTINGS ====================

CORS_ALLOW_ALL_ORIGINS = True  # Change this in production to specific origins
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS', 
    default='http://localhost:3000,http://localhost:8000'
).split(',')

# ==================== CUSTOM USER MODEL ====================

AUTH_USER_MODEL = 'users.CustomUser'

# ==================== PAYMENT SYSTEM SETTINGS ====================

# Backup settings
BACKUP_DIR = BASE_DIR / 'backups'
BACKUP_RETENTION_DAYS = config('BACKUP_RETENTION_DAYS', default=30, cast=int)

# Payment limits (for security)
MAX_WALLET_BALANCE = config('MAX_WALLET_BALANCE', default=10000, cast=float)  # Maximum wallet balance
MAX_DAILY_PURCHASES = config('MAX_DAILY_PURCHASES', default=10, cast=int)     # Max purchases per day per student
MAX_RECHARGE_AMOUNT = config('MAX_RECHARGE_AMOUNT', default=5000, cast=float) # Max recharge amount per transaction

# Email settings (for notifications)
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@example.com')

# Celery settings (for async tasks like backups)
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_TIMEZONE = 'UTC'
CELERY_BEAT_SCHEDULE = {
    'daily-financial-backup': {
        'task': 'payments.tasks.daily_financial_backup',
        'schedule': timedelta(days=1),
        'args': (),
    },
    'update-course-stats': {
        'task': 'payments.tasks.update_all_course_stats',
        'schedule': timedelta(hours=6),
        'args': (),
    },
    'cleanup-old-logs': {
        'task': 'payments.tasks.cleanup_old_payment_logs',
        'schedule': timedelta(days=7),
        'args': (90,),  # Keep logs for 90 days
    },
}

# ==================== LOGGING CONFIGURATION ====================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'payment': {
            'format': '{asctime} - {levelname} - Payment Action: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'payment_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs/payment_system.log',
            'formatter': 'payment',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs/error.log',
            'formatter': 'verbose',
        },
        'audit_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs/audit.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'error_file'],
            'level': 'INFO',
            'propagate': True,
        },
        'payments': {
            'handlers': ['payment_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'notifications': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'reports': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'audit': {
            'handlers': ['audit_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# ==================== SECURITY SETTINGS ====================

# Session settings
SESSION_COOKIE_AGE = 86400  # 24 hours in seconds
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# CSRF settings
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
CSRF_COOKIE_SECURE = not DEBUG  # Only secure in production
CSRF_COOKIE_HTTPONLY = True

# Security headers (for production)
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ==================== API DOCUMENTATION ====================

SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'USE_SESSION_AUTH': False,
    'JSON_EDITOR': True,
    'SHOW_REQUEST_HEADERS': True,
    'VALIDATOR_URL': None,
}

# ==================== APP SPECIFIC SETTINGS ====================

# Payments app
PAYMENT_SYSTEM = {
    'CURRENCY': 'EGP',
    'CURRENCY_SYMBOL': '£',
    'DEFAULT_TIMEZONE': 'Africa/Cairo',
    'ALLOW_MANUAL_DEPOSITS': True,
    'ALLOW_REFUNDS': True,
    'REQUIRE_REASON_FOR_MANUAL_DEPOSIT': True,
    'MAX_RETRY_ATTEMPTS': 3,
}

# Notifications app
NOTIFICATIONS = {
    'IN_APP_ENABLED': True,
    'EMAIL_ENABLED': False,
    'PUSH_ENABLED': False,
    'SMS_ENABLED': False,
    'RETENTION_DAYS': 90,
    'BATCH_SIZE': 50,
}

# Dashboard app
DASHBOARD = {
    'CACHE_TIMEOUT': 300,  # 5 minutes in seconds
    'REFRESH_INTERVAL': 60,  # 1 minute in seconds for auto-refresh
    'MAX_DATA_POINTS': 100,
}

# Reports app
REPORTS = {
    'MAX_EXPORT_ROWS': 10000,
    'ALLOWED_FORMATS': ['json', 'csv', 'excel'],
    'CACHE_TIMEOUT': 600,  # 10 minutes in seconds
    'MAX_CONCURRENT_REPORTS': 5,
}