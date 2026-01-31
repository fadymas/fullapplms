# users/services.py
"""
Service layer for user-related business logic.
Follows Single Responsibility Principle.
"""

from django.core.exceptions import ValidationError
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, StudentProfile, TeacherAdminProfile


class UserCreationService:
    """Handles user creation with proper validation and profile creation."""
    
    @classmethod
    def create_student_user(cls, email: str, password: str, profile_data: dict) -> CustomUser:
        """Create a student user with their profile."""
        cls._validate_password(password)
        
        # Handle name fields
        full_name = profile_data.get('full_name', '')
        first_name = profile_data.get('first_name', '')
        last_name = profile_data.get('last_name', '')
        
        # If first_name and last_name are provided, use them
        if first_name and last_name:
            profile_data['first_name'] = first_name
            profile_data['last_name'] = last_name
            if not full_name:
                profile_data['full_name'] = f"{first_name} {last_name}"
        # If only full_name is provided, split it
        elif full_name and not (first_name or last_name):
            parts = full_name.split(' ', 1)
            if len(parts) == 2:
                profile_data['first_name'] = parts[0]
                profile_data['last_name'] = parts[1]
            elif len(parts) == 1:
                profile_data['first_name'] = parts[0]
                profile_data['last_name'] = ""
        
        with transaction.atomic():
            user = CustomUser.objects.create_user(
                email=email,
                password=password,
                role='student'
            )
            
            StudentProfile.objects.create(
                user=user,
                **profile_data
            )
        
        return user
    
    @classmethod
    def create_teacher_admin_user(cls, email: str, password: str, role: str, profile_data: dict) -> CustomUser:
        """Create a teacher or admin user with their profile."""
        cls._validate_password(password)
        
        if role not in ['teacher', 'admin']:
            raise ValidationError(f"Invalid role: {role}")
        
        # Ensure first_name and last_name exist
        if not profile_data.get('first_name') or not profile_data.get('last_name'):
            raise ValidationError("First name and last name are required for teachers/admins")
        
        with transaction.atomic():
            user = CustomUser.objects.create_user(
                email=email,
                password=password,
                role=role
            )
            
            TeacherAdminProfile.objects.create(
                user=user,
                **profile_data
            )
        
        return user
    
    @classmethod
    def create_user_by_admin(cls, user_data: dict) -> CustomUser:
        """Create any type of user by admin."""
        role = user_data.get('role')
        
        if role == 'student':
            return cls.create_student_user(
                email=user_data['email'],
                password=user_data['password'],
                profile_data={
                    'full_name': user_data.get('full_name', ''),
                    'first_name': user_data.get('first_name', ''),
                    'last_name': user_data.get('last_name', ''),
                    'phone': user_data.get('phone', ''),
                    'guardian_phone': user_data.get('guardian_phone', ''),
                    'grade': user_data.get('grade', '')
                }
            )
        else:
            return cls.create_teacher_admin_user(
                email=user_data['email'],
                password=user_data['password'],
                role=role,
                profile_data={
                    'first_name': user_data.get('first_name', ''),
                    'last_name': user_data.get('last_name', ''),
                    'date_of_birth': user_data.get('date_of_birth'),
                    'gender': user_data.get('gender'),
                    'specialization': user_data.get('specialization', ''),
                    'bio': user_data.get('bio', ''),
                    'phone': user_data.get('phone', '')
                }
            )
    
    @staticmethod
    def _validate_password(password: str) -> None:
        """Validate password against Django's validators."""
        validate_password(password)


class ProfileUpdateService:
    """Handles profile updates with validation."""
    
    @staticmethod
    def update_student_profile(user: CustomUser, data: dict) -> StudentProfile:
        """Update student profile."""
        if user.role != 'student':
            raise ValidationError("User is not a student")
        
        profile = StudentProfile.objects.get(user=user)
        
        # Handle name updates
        if 'first_name' in data or 'last_name' in data:
            first_name = data.get('first_name', profile.first_name)
            last_name = data.get('last_name', profile.last_name)
            if first_name and last_name:
                data['full_name'] = f"{first_name} {last_name}".strip()
        
        for field, value in data.items():
            if hasattr(profile, field):
                setattr(profile, field, value)
        profile.save()
        return profile
    
    @staticmethod
    def update_teacher_admin_profile(user: CustomUser, data: dict) -> TeacherAdminProfile:
        """Update teacher/admin profile."""
        if user.role not in ['teacher', 'admin']:
            raise ValidationError("User is not a teacher or admin")
        
        profile = TeacherAdminProfile.objects.get(user=user)
        for field, value in data.items():
            if hasattr(profile, field):
                setattr(profile, field, value)
        profile.save()
        return profile