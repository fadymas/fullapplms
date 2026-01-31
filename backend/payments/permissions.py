"""
Custom permissions for payments app.
"""
from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()


class IsCourseInstructor(permissions.BasePermission):
    """
    Permission to check if user is the instructor of a course.
    """
    
    def has_permission(self, request, view):
        # This permission only works with object-level permissions
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # For course-related objects
        if hasattr(obj, 'course'):
            return obj.course.instructor == request.user
        # For course itself
        elif hasattr(obj, 'instructor'):
            return obj.instructor == request.user
        # For course stats
        elif hasattr(obj, 'course') and hasattr(obj.course, 'instructor'):
            return obj.course.instructor == request.user
        return False


class IsStudentOwner(permissions.BasePermission):
    """
    Permission to check if user is the owner (student) of an object.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # For objects with student field
        if hasattr(obj, 'student'):
            return obj.student == request.user
        # For wallet
        elif hasattr(obj, 'wallet'):
            return obj.wallet.student == request.user
        # For wallet itself
        elif hasattr(obj, 'student'):
            return obj.student == request.user
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission to allow read-only for all, write for admin only.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to admins
        return request.user.is_authenticated and request.user.role == 'admin'


class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Permission to allow teachers and admins only.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['teacher', 'admin']


class IsFinanceManager(permissions.BasePermission):
    """
    Permission for finance managers (future role).
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'finance_manager']


class CanViewPaymentLogs(permissions.BasePermission):
    """
    Permission to view payment logs (admin only).
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class CanGenerateRechargeCodes(permissions.BasePermission):
    """
    Permission to generate recharge codes (admin only).
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class CanRefundPurchase(permissions.BasePermission):
    """
    Permission to refund purchases (admin only).
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class CanManualDeposit(permissions.BasePermission):
    """
    Permission for manual deposits (admin only).
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'