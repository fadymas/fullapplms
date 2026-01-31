"""
Development settings for LMS Backend.
"""
from .base import *

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# CORS - Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Security settings for development (less strict)
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# Email backend (console for development)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Django Debug Toolbar (optional, install if needed)
# INSTALLED_APPS += ['debug_toolbar']
# MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']

# Logging - more verbose in development but avoid noisy autoreload DEBUG logs
# Keep root logger at INFO to suppress framework debug noise (e.g. autoreload)
LOGGING['root']['level'] = 'INFO'

# Elevate app loggers to DEBUG if you want detailed app output in dev
for name in ['users', 'courses', 'payments', 'quizzes']:
    if name in LOGGING['loggers']:
        LOGGING['loggers'][name]['level'] = 'DEBUG'

# Silence django autoreload debug spam (it logs file scanning at DEBUG level)
LOGGING['loggers'].setdefault('django.utils.autoreload', {
    'handlers': ['console', 'file'],
    'level': 'INFO',
    'propagate': False,
})

