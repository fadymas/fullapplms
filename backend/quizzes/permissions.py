# permissions.py
"""
??????? ????? ????????
???? ??????? ?????????? ????? ??? ???????
"""

from rest_framework.permissions import BasePermission
from django.contrib.auth.models import AnonymousUser


class IsStudent(BasePermission):
    """
    ???? ??? ??????
    """
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and 
            user.is_authenticated and 
            not isinstance(user, AnonymousUser) and
            hasattr(user, 'role') and 
            user.role == 'student'
        )


class IsTeacher(BasePermission):
    """
    ???? ??? ????????
    """
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and 
            user.is_authenticated and 
            not isinstance(user, AnonymousUser) and
            hasattr(user, 'role') and 
            user.role == 'teacher'
        )


class IsAdmin(BasePermission):
    """
    ???? ??? ???????
    """
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and 
            user.is_authenticated and 
            not isinstance(user, AnonymousUser) and
            hasattr(user, 'role') and 
            user.role == 'admin'
        )


class IsTeacherOrAdmin(BasePermission):
    """
    ???? ???????? ????????
    """
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and 
            user.is_authenticated and 
            not isinstance(user, AnonymousUser) and
            hasattr(user, 'role') and 
            user.role in ['teacher', 'admin']
        )


class IsCourseTeacherOrAdmin(BasePermission):
    """
    ???? ????? ?????? ?? ??????
    """
    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated and not isinstance(user, AnonymousUser)):
            return False
            
        if not hasattr(user, 'role'):
            return False
            
        if user.role == 'admin':
            return True
            
        if user.role == 'teacher':
            # ?? ??? ViewSet ?????? ?? ?? ?????? ??? ??????
            return True
            
        return False