# users/views.py
from rest_framework import viewsets, generics, status, mixins
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.db import models

from .models import CustomUser, StudentProfile, TeacherAdminProfile
from .serializers import (
    CustomUserSerializer, RegisterSerializer, LoginSerializer,
    StudentProfileSerializer, TeacherAdminProfileSerializer,
    AdminCreateUserSerializer, CompleteUserProfileSerializer  # أضف هذا
)
from .permissions import (
    IsAdminUser, IsTeacherUser, IsStudentUser,
    IsAdminOrTeacherUser, IsOwnerOrAdmin, IsProfileOwnerOrAdmin
)
from .services import ProfileUpdateService


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management.
    Admins can perform all actions, users can only view/edit their own profile.
    """
    queryset = CustomUser.objects.all().select_related(
        'student_profile', 'teacher_admin_profile'
    )
    serializer_class = CustomUserSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions for each action.
        """
        if self.action in ['list', 'create', 'destroy']:
            return [IsAdminUser()]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return [IsOwnerOrAdmin()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdminCreateUserSerializer
        return CustomUserSerializer
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """Get or update current user's information."""
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        else:  # PATCH
            serializer = self.get_serializer(
                request.user, 
                data=request.data, 
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_me(self, request):
        """Update current user's profile."""
        serializer = self.get_serializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class StudentProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for student profiles."""
    queryset = StudentProfile.objects.all().select_related('user')
    serializer_class = StudentProfileSerializer
    permission_classes = [IsProfileOwnerOrAdmin]
    
    def get_queryset(self):
        """Optimize queryset based on user role."""
        queryset = super().get_queryset()
        
        if self.request.user.role == 'teacher':
            # TODO: Filter by teacher's courses when implemented
            return queryset
        elif self.request.user.role == 'student':
            return queryset.filter(user=self.request.user)
        
        return queryset


class TeacherAdminProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for teacher/admin profiles."""
    queryset = TeacherAdminProfile.objects.all().select_related('user')
    serializer_class = TeacherAdminProfileSerializer
    permission_classes = [IsProfileOwnerOrAdmin]
    
    def get_queryset(self):
        """Optimize queryset based on user role."""
        queryset = super().get_queryset()
        
        if self.request.user.role == 'student':
            # Students can see all teachers
            return queryset.filter(user__role='teacher')
        
        return queryset


class AuthViewSet(viewsets.GenericViewSet):
    """Authentication related views."""
    permission_classes = []
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new student."""
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': CustomUserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login user and return JWT tokens."""
        serializer = LoginSerializer(
            data=request.data, 
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': CustomUserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    
    @action(detail=False, methods=['post'], permission_classes=[])
    def logout(self, request):
        """Logout user by blacklisting refresh token."""
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Successfully logged out."},
                status=status.HTTP_205_RESET_CONTENT
            )
        except TokenError:
            return Response(
                {"error": "Invalid refresh token."},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        """Refresh access token."""
        refresh_token = request.data.get("refresh")
        
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token),
            })
        except TokenError:
            return Response(
                {"error": "Invalid refresh token."},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileUpdateView(APIView):
    """Update current user's profile."""
    permission_classes = [IsOwnerOrAdmin]
    
    def patch(self, request):
        """Update user's profile based on their role."""
        user = request.user
        
        try:
            if user.role == 'student':  # Fixed: استخدام string مباشرة بدلاً من CustomUser.Role.STUDENT
                profile = ProfileUpdateService.update_student_profile(
                    user, request.data
                )
                serializer = StudentProfileSerializer(profile)
            else:
                profile = ProfileUpdateService.update_teacher_admin_profile(
                    user, request.data
                )
                serializer = TeacherAdminProfileSerializer(profile)
            
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfilesViewSet(viewsets.GenericViewSet):
    """
    ViewSet for user profiles with role-based access control.
    """
    permission_classes = [IsOwnerOrAdmin]
    
    def get_queryset(self):
        """Get queryset based on user role - optimized version."""
        user = self.request.user
        
        if user.role == 'admin':
            return CustomUser.objects.all()
        elif user.role == 'teacher':
            # Teachers can see all teachers and students (but not other admins)
            return CustomUser.objects.filter(
                models.Q(role='student') | models.Q(role='teacher')
            )
        elif user.role == 'student':
            # Students can see teachers and other students
            return CustomUser.objects.filter(
                models.Q(role='student') | models.Q(role='teacher')
            )
        
        return CustomUser.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get authenticated user's complete profile."""
        user = request.user
        
        # تحسين الأداء: جلب البروفايلات في query واحدة
        if user.role == 'student':
            try:
                # جلب المستخدم مع البروفايل في query واحدة
                user_with_profile = CustomUser.objects.filter(id=user.id).first()
            except:
                user_with_profile = user
        else:
            user_with_profile = user
        
        serializer = CompleteUserProfileSerializer(user_with_profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def list_profiles(self, request):
        """List user profiles with role-based filtering."""
        queryset = self.get_queryset()
        
        # Apply additional filters
        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Search by email or name
        search = request.query_params.get('search')
        if search:
            # استخدام Q objects للبحث بأمان
            from django.db.models import Q
            search_query = Q(email__icontains=search)
            
            # إضافة شروط البحث للطلاب
            student_profiles = StudentProfile.objects.filter(
                full_name__icontains=search
            ).values_list('user_id', flat=True)
            if student_profiles:
                search_query |= Q(id__in=student_profiles)
            
            # إضافة شروط البحث للمعلمين
            teacher_profiles = TeacherAdminProfile.objects.filter(
                Q(first_name__icontains=search) | Q(last_name__icontains=search)
            ).values_list('user_id', flat=True)
            if teacher_profiles:
                search_query |= Q(id__in=teacher_profiles)
            
            queryset = queryset.filter(search_query)
        
        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get('page_size', 20)
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        
        serializer = CompleteUserProfileSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def profile_detail(self, request, pk=None):
        """Get specific user's profile."""
        try:
            user = self.get_queryset().get(id=pk)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "User not found or you don't have permission to view this profile."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CompleteUserProfileSerializer(user)
        return Response(serializer.data)

class StudentProfilesView(APIView):
    """
    View for student profiles with role-based permissions.
    Students can see other students, teachers/admins can see all students.
    """
    permission_classes = [IsOwnerOrAdmin]  # Fixed
    
    def get(self, request):
        """Get list of student profiles."""
        user = request.user
        
        if user.role in ['admin', 'teacher']:
            # Admins and teachers can see all students
            students = StudentProfile.objects.all().select_related('user')
        elif user.role == 'student':
            # SECURITY FIX: Students cannot list all student profiles to protect PII
            return Response(
                {"error": "Students do not have permission to list all student profiles."},
                status=status.HTTP_403_FORBIDDEN
            )
        else:
            return Response(
                {"error": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Apply filters
        grade = request.query_params.get('grade')
        if grade:
            students = students.filter(grade=grade)
        
        search = request.query_params.get('search')
        if search:
            students = students.filter(
                models.Q(full_name__icontains=search) |
                models.Q(user__email__icontains=search)
            )
        
        # Pagination using DRF's pagination
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get('page_size', 20)
        paginated_students = paginator.paginate_queryset(students, request)
        
        serializer = StudentProfileSerializer(paginated_students, many=True)
        return paginator.get_paginated_response(serializer.data)


class TeacherProfilesView(APIView):
    """
    View for teacher profiles.
    All authenticated users can see teachers.
    """
    permission_classes = [IsOwnerOrAdmin]  # Fixed
    
    def get(self, request):
        """Get list of teacher profiles."""
        user = request.user
        
        # Teachers can be seen by all authenticated users
        if user.role == 'admin':
            teachers = TeacherAdminProfile.objects.filter(
                models.Q(user__role='teacher') | models.Q(user__role='admin')
            ).select_related('user')
        else:
            teachers = TeacherAdminProfile.objects.filter(
                user__role='teacher'
            ).select_related('user')
        
        # Apply filters
        specialization = request.query_params.get('specialization')
        if specialization:
            teachers = teachers.filter(specialization__icontains=specialization)
        
        search = request.query_params.get('search')
        if search:
            teachers = teachers.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(user__email__icontains=search) |
                models.Q(specialization__icontains=search)
            )
        
        # Pagination using DRF's pagination
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get('page_size', 20)
        paginated_teachers = paginator.paginate_queryset(teachers, request)
        
        serializer = TeacherAdminProfileSerializer(paginated_teachers, many=True)
        return paginator.get_paginated_response(serializer.data)