# users/permissions.py
from rest_framework import permissions


class BaseRolePermission(permissions.BasePermission):
    """Base permission class for role-based access control."""
    allowed_roles = []
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role in self.allowed_roles
        )


class IsAdminUser(BaseRolePermission):
    """Allows access only to admin users."""
    allowed_roles = ['admin']


class IsTeacherUser(BaseRolePermission):
    """Allows access only to teacher users."""
    allowed_roles = ['teacher']


class IsStudentUser(BaseRolePermission):
    """Allows access only to student users."""
    allowed_roles = ['student']


class IsAdminOrTeacherUser(BaseRolePermission):
    """Allows access to admin and teacher users."""
    allowed_roles = ['admin', 'teacher']


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners or admins to access an object.
    Assumes the object has a 'user' attribute.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admins can access anything
        if request.user.role == 'admin':
            return True
        
        # Check if object has a user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'id'):
            return obj.id == request.user.id
        
        return False


class IsProfileOwnerOrAdmin(IsOwnerOrAdmin):
    """Permission for profile access - owner or admin only."""
    
    def has_permission(self, request, view):
        # Allow list view only for admins
        if view.action == 'list':
            return request.user.role == 'admin'
        return True
    


class CanViewProfiles(BaseRolePermission):
    """
    Permission to view user profiles based on role.
    """
    def has_permission(self, request, view):
        # All authenticated users can view profiles
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Object-level permission for viewing specific user profiles.
        """
        user = request.user
        
        # Admin can view everything
        if user.role == 'admin':
            return True
        
        # Users can always view their own profile
        if obj == user:
            return True
        
        # Role-based viewing rules
        if user.role == 'teacher':
            # Teachers can view students and other teachers
            return obj.role in ['student', 'teacher']
        
        elif user.role == 'student':
            # Students can view teachers and other students
            return obj.role in ['teacher', 'student']
        
        return False


class CanViewStudentProfiles(BaseRolePermission):
    """
    Permission to view student profiles.
    """
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        
        # Only teachers and admins can view student lists (SECURITY FIX)
        if view.action == 'list':
            return request.user.role in ['admin', 'teacher']
        
        return True
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin can view any student
        if user.role == 'admin':
            return True
        
        # Teachers can view any student
        if user.role == 'teacher':
            return True
        
        # Students can view other students (individual access only, not list)
        if user.role == 'student':
            return True
        
        return False


class CanViewTeacherProfiles(BaseRolePermission):
    """
    Permission to view teacher profiles.
    """
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        
        # All authenticated users can view teacher lists
        return True
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Everyone can view teacher profiles
        if obj.role == 'teacher':
            return True
        
        # Only admins can view other admin profiles
        if obj.role == 'admin':
            return user.role == 'admin'
        
        return False