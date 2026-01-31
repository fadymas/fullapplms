"""
Django settings for LMS Backend project.
"""
from decouple import config
import os

# Determine which environment we're in
ENVIRONMENT = config('DJANGO_ENV', default='dev')

if ENVIRONMENT == 'prod':
    from .prod import *
elif ENVIRONMENT == 'dev':
    from .dev import *
else:
    from .dev import *  # Default to dev

