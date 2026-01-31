# users/tests.py
"""
Comprehensive test suite for LMS User Management System
Coverage: Models, Services, Serializers, Views, Permissions, Authentication
Run with: python manage.py test users
For coverage: coverage run --source='.' manage.py test users && coverage report
"""

from django.test import TestCase, TransactionTestCase
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date

from .models import CustomUser, StudentProfile, TeacherAdminProfile
from .services import UserCreationService, ProfileUpdateService
from .serializers import RegisterSerializer, LoginSerializer


User = get_user_model()


# ============================================================================
# MODEL TESTS
# ============================================================================

class CustomUserModelTests(TestCase):
    """Test CustomUser model functionality."""
    
    def setUp(self):
        self.student_data = {
            'email': 'student@test.com',
            'password': 'TestPass123!',
            'role': 'student'
        }
    
    def test_create_user_success(self):
        """Test successful user creation."""
        user = User.objects.create_user(**self.student_data)
        self.assertEqual(user.email, 'student@test.com')
        self.assertEqual(user.role, 'student')
        self.assertTrue(user.is_active)
        self.assertFalse(user.email_verified)
    
    def test_create_superuser(self):
        """Test superuser creation."""
        admin = User.objects.create_superuser(
            email='admin@test.com',
            password='AdminPass123!'
        )
        self.assertEqual(admin.role, 'admin')
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
    
    def test_user_email_unique(self):
        """Test email uniqueness constraint."""
        User.objects.create_user(**self.student_data)
        with self.assertRaises(Exception):
            User.objects.create_user(**self.student_data)
    
    def test_user_without_email_fails(self):
        """Test user creation fails without email."""
        with self.assertRaises(ValidationError):
            User.objects.create_user(email='', password='TestPass123!', role='student')
    
    def test_invalid_email_format(self):
        """Test invalid email format validation."""
        with self.assertRaises(ValidationError):
            User.objects.create_user(
                email='invalid-email',
                password='TestPass123!',
                role='student'
            )
    
    def test_user_str_representation(self):
        """Test string representation."""
        user = User.objects.create_user(**self.student_data)
        self.assertEqual(str(user), 'student@test.com')


class StudentProfileModelTests(TestCase):
    """Test StudentProfile model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='student@test.com',
            password='TestPass123!',
            role='student'
        )
    
    def test_create_student_profile(self):
        """Test student profile creation."""
        profile = StudentProfile.objects.create(
            user=self.user,
            full_name='Ahmed Mohamed',
            phone='+201234567890',
            grade='Grade 10'
        )
        self.assertEqual(profile.full_name, 'Ahmed Mohamed')
        self.assertIsNotNone(profile.created_at)
    
    def test_student_profile_wrong_role_fails(self):
        """Test student profile with wrong role fails."""
        teacher = User.objects.create_user(
            email='teacher@test.com',
            password='TestPass123!',
            role='teacher'
        )
        profile = StudentProfile(user=teacher, full_name='Test')
        with self.assertRaises(ValidationError):
            profile.full_clean()


class TeacherAdminProfileModelTests(TestCase):
    """Test TeacherAdminProfile model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='teacher@test.com',
            password='TestPass123!',
            role='teacher'
        )
    
    def test_create_teacher_profile(self):
        """Test teacher profile creation."""
        profile = TeacherAdminProfile.objects.create(
            user=self.user,
            first_name='Sara',
            last_name='Ali',
            specialization='Mathematics'
        )
        self.assertEqual(profile.first_name, 'Sara')
        self.assertEqual(profile.full_name, 'Sara Ali')
    
    def test_full_name_property(self):
        """Test full_name property."""
        profile = TeacherAdminProfile.objects.create(
            user=self.user,
            first_name='Sara',
            last_name='Ali'
        )
        self.assertEqual(profile.full_name, 'Sara Ali')


# ============================================================================
# SERVICE TESTS
# ============================================================================

class UserCreationServiceTests(TransactionTestCase):
    """Test UserCreationService."""
    
    def test_create_student_user(self):
        """Test creating student with profile."""
        user = UserCreationService.create_student_user(
            email='student@test.com',
            password='TestPass123!',
            profile_data={
                'full_name': 'Ahmed Mohamed',
                'phone': '+201234567890',
                'grade': 'Grade 10'
            }
        )
        
        self.assertEqual(user.role, 'student')
        self.assertTrue(hasattr(user, 'studentprofile'))
        self.assertEqual(user.studentprofile.full_name, 'Ahmed Mohamed')
    
    def test_create_teacher_user(self):
        """Test creating teacher with profile."""
        user = UserCreationService.create_teacher_admin_user(
            email='teacher@test.com',
            password='TeacherPass123!',
            role='teacher',
            profile_data={
                'first_name': 'Sara',
                'last_name': 'Ali',
                'specialization': 'Physics'
            }
        )
        
        self.assertEqual(user.role, 'teacher')
        self.assertTrue(hasattr(user, 'teacheradminprofile'))
    
    def test_invalid_role_fails(self):
        """Test invalid role raises error."""
        with self.assertRaises(ValidationError):
            UserCreationService.create_teacher_admin_user(
                email='test@test.com',
                password='TestPass123!',
                role='invalid_role',
                profile_data={'first_name': 'Test', 'last_name': 'User'}
            )
    
    def test_weak_password_fails(self):
        """Test weak password is rejected."""
        with self.assertRaises(ValidationError):
            UserCreationService.create_student_user(
                email='student@test.com',
                password='123',
                profile_data={'full_name': 'Test Student'}
            )


class ProfileUpdateServiceTests(TestCase):
    """Test ProfileUpdateService."""
    
    def setUp(self):
        self.student = UserCreationService.create_student_user(
            email='student@test.com',
            password='TestPass123!',
            profile_data={'full_name': 'Ahmed Mohamed'}
        )
    
    def test_update_student_profile(self):
        """Test updating student profile."""
        updated = ProfileUpdateService.update_student_profile(
            self.student,
            {'full_name': 'Ahmed Updated', 'grade': 'Grade 11'}
        )
        
        self.assertEqual(updated.full_name, 'Ahmed Updated')
        self.assertEqual(updated.grade, 'Grade 11')


# ============================================================================
# SERIALIZER TESTS
# ============================================================================

class RegisterSerializerTests(TestCase):
    """Test RegisterSerializer."""
    
    def test_valid_registration_data(self):
        """Test valid registration."""
        data = {
            'email': 'new@test.com',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
            'full_name': 'New Student'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_password_mismatch_fails(self):
        """Test password mismatch."""
        data = {
            'email': 'student@test.com',
            'password': 'SecurePass123!',
            'password2': 'Different123!',
            'full_name': 'Test'
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_duplicate_email_fails(self):
        """Test duplicate email rejection."""
        User.objects.create_user(
            email='existing@test.com',
            password='TestPass123!',
            role='student'
        )
        
        data = {
            'email': 'existing@test.com',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
            'full_name': 'Test'
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())


class LoginSerializerTests(TestCase):
    """Test LoginSerializer."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            password='TestPass123!',
            role='student'
        )
    
    def test_valid_login(self):
        """Test valid login."""
        data = {'email': 'test@test.com', 'password': 'TestPass123!'}
        serializer = LoginSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_invalid_password(self):
        """Test invalid password."""
        data = {'email': 'test@test.com', 'password': 'Wrong'}
        serializer = LoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())


# ============================================================================
# API TESTS - AUTHENTICATION
# ============================================================================

class AuthenticationAPITests(APITestCase):
    """Test authentication endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
    
    def test_register_success(self):
        """Test successful registration."""
        data = {
            'email': 'new@test.com',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
            'full_name': 'Ahmed Mohamed',
            'grade': 'Grade 10'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'new@test.com')
    
    def test_register_duplicate_email_fails(self):
        """Test registration with existing email."""
        User.objects.create_user(
            email='existing@test.com',
            password='TestPass123!',
            role='student'
        )
        
        data = {
            'email': 'existing@test.com',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
            'full_name': 'Test'
        }
        
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_success(self):
        """Test successful login."""
        User.objects.create_user(
            email='student@test.com',
            password='TestPass123!',
            role='student'
        )
        
        data = {'email': 'student@test.com', 'password': 'TestPass123!'}
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password."""
        User.objects.create_user(
            email='student@test.com',
            password='TestPass123!',
            role='student'
        )
        
        data = {'email': 'student@test.com', 'password': 'Wrong'}
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_logout_success(self):
        """Test successful logout."""
        user = User.objects.create_user(
            email='student@test.com',
            password='TestPass123!',
            role='student'
        )
        
        refresh = RefreshToken.for_user(user)
        data = {'refresh': str(refresh)}
        
        response = self.client.post(self.logout_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)


# ============================================================================
# API TESTS - PROFILE MANAGEMENT
# ============================================================================

class ProfileAPITests(APITestCase):
    """Test profile endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        
        self.student = UserCreationService.create_student_user(
            email='student@test.com',
            password='TestPass123!',
            profile_data={'full_name': 'Ahmed', 'grade': 'Grade 10'}
        )
        
        self.teacher = UserCreationService.create_teacher_admin_user(
            email='teacher@test.com',
            password='TeacherPass123!',
            role='teacher',
            profile_data={
                'first_name': 'Sara',
                'last_name': 'Ali',
                'specialization': 'Math'
            }
        )
        
        self.my_profile_url = reverse('my-profile')
        self.profile_update_url = reverse('profile-update')
    
    def test_get_my_profile_student(self):
        """Test getting own profile as student."""
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.my_profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'student@test.com')
        self.assertEqual(response.data['role'], 'student')
    
    def test_get_my_profile_teacher(self):
        """Test getting own profile as teacher."""
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get(self.my_profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'teacher')
    
    def test_get_profile_unauthenticated(self):
        """Test unauthenticated access fails."""
        response = self.client.get(self.my_profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_update_student_profile(self):
        """Test updating student profile."""
        self.client.force_authenticate(user=self.student)
        
        data = {'full_name': 'Ahmed Updated', 'grade': 'Grade 11'}
        response = self.client.patch(self.profile_update_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Ahmed Updated')


# ============================================================================
# API TESTS - USER LISTINGS
# ============================================================================

class UserListingAPITests(APITestCase):
    """Test user listing endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create test users
        self.student1 = UserCreationService.create_student_user(
            email='student1@test.com',
            password='TestPass123!',
            profile_data={'full_name': 'Student One', 'grade': 'Grade 10'}
        )
        
        self.student2 = UserCreationService.create_student_user(
            email='student2@test.com',
            password='TestPass123!',
            profile_data={'full_name': 'Student Two', 'grade': 'Grade 11'}
        )
        
        self.teacher = UserCreationService.create_teacher_admin_user(
            email='teacher@test.com',
            password='TeacherPass123!',
            role='teacher',
            profile_data={
                'first_name': 'Sara',
                'last_name': 'Ali',
                'specialization': 'Mathematics'
            }
        )
        
        self.admin = User.objects.create_superuser(
            email='admin@test.com',
            password='AdminPass123!'
        )
        
        # Create admin profile (required for admin users)
        TeacherAdminProfile.objects.create(
            user=self.admin,
            first_name='Admin',
            last_name='User',
            specialization='Administration'
        )
        
        self.students_url = reverse('student-profiles')
        self.teachers_url = reverse('teacher-profiles')
    
    def test_list_students_as_teacher(self):
        """Test teacher can list students."""
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get(self.students_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 2)
    
    def test_filter_students_by_grade(self):
        """Test filtering students by grade."""
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get(f'{self.students_url}?grade=Grade 10')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for student in response.data['results']:
            self.assertEqual(student['grade'], 'Grade 10')
    
    def test_list_teachers_as_student(self):
        """Test student can list teachers."""
        self.client.force_authenticate(user=self.student1)
        response = self.client.get(self.teachers_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)
    
    def test_list_students_unauthenticated(self):
        """Test unauthenticated access to student list."""
        response = self.client.get(self.students_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ============================================================================
# PERMISSION TESTS
# ============================================================================

class PermissionTests(APITestCase):
    """Test role-based permissions."""
    
    def setUp(self):
        self.client = APIClient()
        
        self.student = UserCreationService.create_student_user(
            email='student@test.com',
            password='TestPass123!',
            profile_data={'full_name': 'Student'}
        )
        
        self.teacher = UserCreationService.create_teacher_admin_user(
            email='teacher@test.com',
            password='TeacherPass123!',
            role='teacher',
            profile_data={'first_name': 'Teacher', 'last_name': 'Test'}
        )
        
        self.admin = User.objects.create_superuser(
            email='admin@test.com',
            password='AdminPass123!'
        )
        
        # Create admin profile
        TeacherAdminProfile.objects.create(
            user=self.admin,
            first_name='Admin',
            last_name='User',
            specialization='Administration'
        )
    
    def test_student_cannot_access_admin_endpoints(self):
        """Test student blocked from admin endpoints."""
        self.client.force_authenticate(user=self.student)
        
        url = reverse('customuser-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_access_all(self):
        """Test admin has full access."""
        self.client.force_authenticate(user=self.admin)
        
        url = reverse('customuser-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_user_can_view_own_profile(self):
        """Test users can view their own profile."""
        self.client.force_authenticate(user=self.student)
        
        response = self.client.get(reverse('my-profile'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'student@test.com')
    
    def test_unauthenticated_user_blocked(self):
        """Test unauthenticated users are blocked."""
        response = self.client.get(reverse('my-profile'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

class FullUserFlowTests(APITestCase):
    """Test complete user workflows."""
    
    def test_complete_student_registration_flow(self):
        """Test full student registration and login flow."""
        # Register
        register_data = {
            'email': 'newstudent@test.com',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!',
            'full_name': 'New Student',
            'grade': 'Grade 10'
        }
        
        register_response = self.client.post(
            reverse('register'),
            register_data,
            format='json'
        )
        
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        access_token = register_response.data['access']
        
        # Use token to get profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        profile_response = self.client.get(reverse('my-profile'))
        
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['email'], 'newstudent@test.com')
        
        # Update profile
        update_data = {'grade': 'Grade 11'}
        update_response = self.client.patch(
            reverse('profile-update'),
            update_data,
            format='json'
        )
        
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['grade'], 'Grade 11')


# ============================================================================
# EDGE CASE TESTS
# ============================================================================

class EdgeCaseTests(TestCase):
    """Test edge cases and boundary conditions."""
    
    def test_very_long_email(self):
        """Test handling of very long email."""
        # Django's EmailField has max_length=254 by default
        long_email = 'a' * 245 + '@test.com'  # 254 characters total
        
        # This should work (at the limit)
        user = User.objects.create_user(
            email=long_email,
            password='TestPass123!',
            role='student'
        )
        self.assertIsNotNone(user)
        
        # This should fail (over the limit)
        too_long_email = 'a' * 250 + '@test.com'  # Over 254 characters
        from django.db import DataError
        with self.assertRaises((ValidationError, DataError)):
            User.objects.create_user(
                email=too_long_email,
                password='TestPass123!',
                role='student'
            )
    
    def test_empty_profile_data(self):
        """Test profile with minimal data."""
        user = User.objects.create_user(
            email='minimal@test.com',
            password='TestPass123!',
            role='student'
        )
        
        profile = StudentProfile.objects.create(
            user=user,
            full_name='Minimal User'
        )
        
        self.assertIsNotNone(profile)
        self.assertIsNone(profile.phone)
        self.assertIsNone(profile.grade)
    
    def test_special_characters_in_name(self):
        """Test names with special characters."""
        user = UserCreationService.create_student_user(
            email='special@test.com',
            password='TestPass123!',
            profile_data={'full_name': "O'Brien-Smith"}
        )
        
        self.assertEqual(user.studentprofile.full_name, "O'Brien-Smith")
    
    def test_unicode_characters_in_name(self):
        """Test names with unicode characters."""
        user = UserCreationService.create_student_user(
            email='arabic@test.com',
            password='TestPass123!',
            profile_data={'full_name': 'محمد أحمد'}
        )
        
        self.assertEqual(user.studentprofile.full_name, 'محمد أحمد')