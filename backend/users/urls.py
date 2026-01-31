# users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

# Import views - تأكد أن هذه هي الـ views الصحيحة
from .views import (
    AuthViewSet,
    ProfileUpdateView,
    UserProfilesViewSet,
    StudentProfilesView,
    TeacherProfilesView,
    UserViewSet
)

# إنشاء routers
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'users/profiles', UserProfilesViewSet, basename='user-profile')

# Note: AuthViewSet يتم تسجيله يدوياً باستخدام as_view()

urlpatterns = [
    # Authentication endpoints using AuthViewSet
    path('auth/register/', AuthViewSet.as_view({'post': 'register'}), name='register'),
    path('auth/login/', AuthViewSet.as_view({'post': 'login'}), name='login'),
    path('auth/logout/', AuthViewSet.as_view({'post': 'logout'}), name='logout'),
    path('auth/refresh/', AuthViewSet.as_view({'post': 'refresh'}), name='auth-refresh'),
    
    # Profile management
    path('profile/', ProfileUpdateView.as_view(), name='profile-update'),
    
    # User profiles endpoints
    path('profiles/me/', UserProfilesViewSet.as_view({'get': 'my_profile'}), name='my-profile'),
    path('profiles/all/', UserProfilesViewSet.as_view({'get': 'list_profiles'}), name='list-profiles'),
    path('profiles/<int:pk>/', UserProfilesViewSet.as_view({'get': 'profile_detail'}), name='profile-detail'),
    
    # Role-specific profile lists
    path('students/all/', StudentProfilesView.as_view(), name='student-profiles'),
    path('teachers/all/', TeacherProfilesView.as_view(), name='teacher-profiles'),
    
    # Include router URLs
    path('', include(router.urls)),
    
    # Token refresh (SimpleJWT built-in)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]