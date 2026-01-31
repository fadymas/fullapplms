"""
Admin configuration for dashboard app.
"""
from django.contrib import admin

# No models to register for dashboard app
# This app only provides API endpoints

admin.site.site_header = "E-Learning Dashboard Admin"
admin.site.site_title = "Dashboard Admin"
admin.site.index_title = "Dashboard Administration"