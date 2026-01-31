"""
Main URL configuration for LMS Backend.
Includes all API endpoints and documentation.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# ==================== API DOCUMENTATION ====================

schema_view = get_schema_view(
   openapi.Info(
      title="LMS Backend API",
      default_version='v1',
      description="Documentation of all LMS APIs",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

# ==================== URL PATTERNS ====================

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), 
         name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), 
         name='schema-redoc'),
    path('swagger.json/', schema_view.without_ui(cache_timeout=0), 
         name='schema-json'),
    
    # Health Check
    path('health/', include('health_check.urls')),
    
    # API Endpoints
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/quizzes/', include('quizzes.urls')),
    
    # New API Endpoints for payment system
    path('api/dashboard/', include('dashboard.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/reports/', include('reports.urls')),
]

# ==================== DEVELOPMENT SETTINGS ====================

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug toolbar
    try:
        import debug_toolbar
        urlpatterns += [
            path('__debug__/', include(debug_toolbar.urls)),
        ]
    except ImportError:
        pass