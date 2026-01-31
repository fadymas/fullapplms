# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
from .models import CustomUser, StudentProfile, TeacherAdminProfile
from .services import UserCreationService


class CustomUserSerializer(serializers.ModelSerializer):
    """Serializer for CustomUser model."""
    role_display = serializers.CharField(source='get_role_display_name', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'role', 'role_display', 'is_active', 
            'email_verified', 'last_login', 'date_joined'
        ]
        read_only_fields = ['last_login', 'date_joined']


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for StudentProfile model."""
    user = CustomUserSerializer(read_only=True)
    phone = serializers.CharField(
        required=False, 
        allow_null=True,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
        )]
    )
    
    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class TeacherAdminProfileSerializer(serializers.ModelSerializer):
    """Serializer for TeacherAdminProfile model."""
    user = CustomUserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TeacherAdminProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_full_name(self, obj):
        """Get full name from first_name and last_name."""
        return f"{obj.first_name} {obj.last_name}"


class RegisterSerializer(serializers.Serializer):
    """Serializer for student registration."""
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    
    # Student profile fields
    full_name = serializers.CharField(max_length=255, required=True)
    first_name = serializers.CharField(max_length=100, required=False, allow_blank=True)  # إضافة
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)   # إضافة
    phone = serializers.CharField(required=False, allow_blank=True)
    guardian_phone = serializers.CharField(required=False, allow_blank=True)
    grade = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        # Check passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check email doesn't exist
        if CustomUser.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})
        
        return attrs
    
    def create(self, validated_data):
        """Create a new student user with profile."""
        try:
            return UserCreationService.create_student_user(
                email=validated_data['email'],
                password=validated_data['password'],
                profile_data={
                    'full_name': validated_data['full_name'],
                    'first_name': validated_data.get('first_name', ''),
                    'last_name': validated_data.get('last_name', ''),
                    'phone': validated_data.get('phone', ''),
                    'guardian_phone': validated_data.get('guardian_phone', ''),
                    'grade': validated_data.get('grade', '')
                }
            )
        except Exception as e:
            raise serializers.ValidationError(str(e))


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                email=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            attrs['user'] = user
            return attrs
        
        raise serializers.ValidationError('Must include "email" and "password".')


class AdminCreateUserSerializer(serializers.Serializer):
    """Serializer for admin to create any type of user."""
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)
    is_active = serializers.BooleanField(default=True)
    
    # Conditional profile fields
    full_name = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        role = attrs.get('role')
        
        if role == 'student':
            # للطالب: إما full_name أو first_name + last_name
            if not attrs.get('full_name') and (not attrs.get('first_name') or not attrs.get('last_name')):
                raise serializers.ValidationError(
                    {"full_name": "Either full_name or both first_name and last_name are required for students."}
                )
        elif role in ['teacher', 'admin']:
            # للمعلم والمدير: first_name و last_name مطلوبان
            if not attrs.get('first_name') or not attrs.get('last_name'):
                raise serializers.ValidationError(
                    {"first_name": "First and last name are required for teachers/admins."}
                )
        
        return attrs
    
    def create(self, validated_data):
        """Create a user with appropriate profile."""
        try:
            return UserCreationService.create_user_by_admin(validated_data)
        except Exception as e:
            raise serializers.ValidationError(str(e))
        

class CompleteUserProfileSerializer(serializers.ModelSerializer):
    """
    Complete user profile serializer with all data.
    Shows user info + profile based on role.
    """
    profile = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()  # إضافة
    last_name = serializers.SerializerMethodField()   # إضافة
    phone = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'role', 'is_active', 'email_verified',
            'last_login', 'date_joined',
            'profile', 'full_name', 'first_name', 'last_name', 'phone'
        ]
        read_only_fields = fields
    
    def get_profile(self, obj):
        """Get profile data based on user role - SAFE version."""
        try:
            if obj.role == 'student':
                try:
                    profile = StudentProfile.objects.get(user=obj)
                    return {
                        'type': 'student',
                        'full_name': profile.full_name,
                        'first_name': profile.first_name,
                        'last_name': profile.last_name,
                        'phone': profile.phone,
                        'guardian_phone': profile.guardian_phone,
                        'grade': profile.grade,
                        'created_at': profile.created_at,
                        'updated_at': profile.updated_at
                    }
                except StudentProfile.DoesNotExist:
                    return {'type': 'student', 'exists': False, 'message': 'Profile not created yet'}
            
            elif obj.role in ['teacher', 'admin']:
                try:
                    profile = TeacherAdminProfile.objects.get(user=obj)
                    return {
                        'type': 'teacher_admin',
                        'first_name': profile.first_name,
                        'last_name': profile.last_name,
                        'full_name': f"{profile.first_name} {profile.last_name}",
                        'date_of_birth': profile.date_of_birth,
                        'gender': profile.gender,
                        'specialization': profile.specialization,
                        'bio': profile.bio,
                        'phone': profile.phone,
                        'email': profile.user.email if profile.user else None,
                        'created_at': profile.created_at,
                        'updated_at': profile.updated_at
                    }
                except TeacherAdminProfile.DoesNotExist:
                    return {'type': obj.role, 'exists': False, 'message': 'Profile not created yet'}
            
            return {'error': 'Unknown role'}
        except Exception as e:
            return {'error': str(e)}
    
    def get_full_name(self, obj):
        """Get user's full name from profile - SAFE version."""
        try:
            if obj.role == 'student':
                try:
                    profile = StudentProfile.objects.get(user=obj)
                    # استخدام first_name + last_name إذا موجودين
                    if profile.first_name and profile.last_name:
                        return f"{profile.first_name} {profile.last_name}"
                    # الرجوع إلى full_name
                    return profile.full_name
                except StudentProfile.DoesNotExist:
                    return None
            elif obj.role in ['teacher', 'admin']:
                try:
                    profile = TeacherAdminProfile.objects.get(user=obj)
                    return f"{profile.first_name} {profile.last_name}"
                except TeacherAdminProfile.DoesNotExist:
                    return None
            return None
        except:
            return None
    
    def get_first_name(self, obj):
        """Get user's first name from profile - SAFE version."""
        try:
            if obj.role == 'student':
                try:
                    profile = StudentProfile.objects.get(user=obj)
                    return profile.first_name
                except StudentProfile.DoesNotExist:
                    return None
            elif obj.role in ['teacher', 'admin']:
                try:
                    profile = TeacherAdminProfile.objects.get(user=obj)
                    return profile.first_name
                except TeacherAdminProfile.DoesNotExist:
                    return None
            return None
        except:
            return None
    
    def get_last_name(self, obj):
        """Get user's last name from profile - SAFE version."""
        try:
            if obj.role == 'student':
                try:
                    profile = StudentProfile.objects.get(user=obj)
                    return profile.last_name
                except StudentProfile.DoesNotExist:
                    return None
            elif obj.role in ['teacher', 'admin']:
                try:
                    profile = TeacherAdminProfile.objects.get(user=obj)
                    return profile.last_name
                except TeacherAdminProfile.DoesNotExist:
                    return None
            return None
        except:
            return None
    
    def get_phone(self, obj):
        """Get user's phone from profile - SAFE version."""
        try:
            if obj.role == 'student':
                try:
                    profile = StudentProfile.objects.get(user=obj)
                    return profile.phone
                except StudentProfile.DoesNotExist:
                    return None
            elif obj.role in ['teacher', 'admin']:
                try:
                    profile = TeacherAdminProfile.objects.get(user=obj)
                    return profile.phone
                except TeacherAdminProfile.DoesNotExist:
                    return None
            return None
        except:
            return None


class PublicUserProfileSerializer(serializers.Serializer):
    """
    Public user profile serializer for viewing other users.
    Shows limited information based on viewer's role.
    """
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)
    role_display = serializers.CharField(source='get_role_display_name', read_only=True)
    full_name = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()  # إضافة
    last_name = serializers.SerializerMethodField()   # إضافة
    profile_summary = serializers.SerializerMethodField()
    
    def get_full_name(self, obj):
        """Get user's full name."""
        if obj.role == 'student' and hasattr(obj, 'student_profile'):
            profile = obj.student_profile
            # استخدام first_name + last_name إذا موجودين
            if profile.first_name and profile.last_name:
                return f"{profile.first_name} {profile.last_name}"
            return profile.full_name
        elif obj.role in ['teacher', 'admin'] and hasattr(obj, 'teacher_admin_profile'):
            profile = obj.teacher_admin_profile
            return f"{profile.first_name} {profile.last_name}"
        return None
    
    def get_first_name(self, obj):
        """Get user's first name."""
        if obj.role == 'student' and hasattr(obj, 'student_profile'):
            return obj.student_profile.first_name
        elif obj.role in ['teacher', 'admin'] and hasattr(obj, 'teacher_admin_profile'):
            return obj.teacher_admin_profile.first_name
        return None
    
    def get_last_name(self, obj):
        """Get user's last name."""
        if obj.role == 'student' and hasattr(obj, 'student_profile'):
            return obj.student_profile.last_name
        elif obj.role in ['teacher', 'admin'] and hasattr(obj, 'teacher_admin_profile'):
            return obj.teacher_admin_profile.last_name
        return None
    
    def get_profile_summary(self, obj):
        """Get profile summary based on role."""
        viewer = self.context.get('request').user
        
        if obj.role == 'student':
            if not hasattr(obj, 'student_profile'):
                return {'type': 'student'}
            
            profile = obj.student_profile
            summary = {
                'type': 'student',
                'grade': profile.grade,
                'first_name': profile.first_name,  # إضافة
                'last_name': profile.last_name     # إضافة
            }
            
            # Admins and teachers see more details
            if viewer.role in ['admin', 'teacher']:
                summary.update({
                    'phone': profile.phone,
                    'guardian_phone': profile.guardian_phone,
                    'created_at': profile.created_at
                })
            
            return summary
        
        elif obj.role == 'teacher':
            if not hasattr(obj, 'teacher_admin_profile'):
                return {'type': 'teacher'}
            
            profile = obj.teacher_admin_profile
            summary = {
                'type': 'teacher',
                'specialization': profile.specialization,
                'first_name': profile.first_name,  # إضافة
                'last_name': profile.last_name     # إضافة
            }
            
            # Admins see more details
            if viewer.role == 'admin':
                summary.update({
                    'phone': profile.phone,
                    'email': profile.email,
                    'created_at': profile.created_at
                })
            
            return summary
        
        elif obj.role == 'admin':
            # Admin profiles are only visible to other admins
            if viewer.role == 'admin' and hasattr(obj, 'teacher_admin_profile'):
                profile = obj.teacher_admin_profile
                return {
                    'type': 'admin',
                    'first_name': profile.first_name,
                    'last_name': profile.last_name,
                    'specialization': profile.specialization,
                    'phone': profile.phone
                }
            return {'type': 'admin'}
        
        return {}