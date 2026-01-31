"""
User models for the LMS platform.
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class CustomUserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, password=None, role='student', **extra_fields):
        """Create and return a regular user with an email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser with an email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)
    
    def get_by_natural_key(self, email):
        """Retrieve a user by their email (natural key)."""
        return self.get(email=email)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model using email as the unique identifier.
    """
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    email_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    def get_role_display_name(self):
        """Get human-readable role name."""
        return dict(self.ROLE_CHOICES).get(self.role, self.role)
    
    def get_full_name(self):
        """Get the full name of the user based on their role and profile."""
        if self.role == 'student':
            if hasattr(self, 'student_profile') and self.student_profile:
                # محاولة استخدام first_name + last_name إذا موجودين
                if self.student_profile.first_name and self.student_profile.last_name:
                    return f"{self.student_profile.first_name} {self.student_profile.last_name}".strip()
                # الرجوع إلى full_name إذا لم يكونا موجودين
                return self.student_profile.full_name
        else:  # teacher or admin
            if hasattr(self, 'teacher_admin_profile') and self.teacher_admin_profile:
                return f"{self.teacher_admin_profile.first_name} {self.teacher_admin_profile.last_name}".strip()
        # Fallback to email if no profile exists
        return self.email


class StudentProfile(models.Model):
    """
    Profile for student users.
    """
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    full_name = models.CharField(max_length=255)
    first_name = models.CharField(max_length=100, blank=True, null=True)  # إضافة
    last_name = models.CharField(max_length=100, blank=True, null=True)  # إضافة
    phone = models.CharField(max_length=20, blank=True, null=True)
    guardian_phone = models.CharField(max_length=20, blank=True, null=True)
    grade = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Student Profile'
        verbose_name_plural = 'Student Profiles'
        ordering = ['full_name']
    
    def __str__(self):
        return f"{self.full_name} ({self.user.email})"
    
    def save(self, *args, **kwargs):
        """Automatically build full_name if first_name and last_name are provided"""
        if self.first_name and self.last_name and not self.full_name:
            self.full_name = f"{self.first_name} {self.last_name}".strip()
        
        # Also update first_name and last_name from full_name if they're empty
        if self.full_name and (not self.first_name or not self.last_name):
            parts = self.full_name.split(' ', 1)
            if len(parts) == 2:
                self.first_name, self.last_name = parts
            elif len(parts) == 1:
                self.first_name = parts[0]
                self.last_name = ""
        
        super().save(*args, **kwargs)


class TeacherAdminProfile(models.Model):
    """
    Profile for teacher and admin users.
    """
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]
    
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='teacher_admin_profile'
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, null=True)
    specialization = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Teacher/Admin Profile'
        verbose_name_plural = 'Teacher/Admin Profiles'
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.user.email})"


class WalletReference(models.Model):
    """
    Reference to wallet in the payments app.
    Stores the wallet ID for quick lookup.
    """
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='wallet_reference',
        limit_choices_to={'role': 'student'}
    )
    wallet_id = models.PositiveIntegerField(
        unique=True,
        db_index=True,
        help_text='ID of the wallet in the payments app'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Wallet Reference'
        verbose_name_plural = 'Wallet References'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Wallet #{self.wallet_id} for {self.user.email}"


class AuditLog(models.Model):
    """
    Audit log for tracking all critical actions in the system.
    """
    class ActionType(models.TextChoices):
        USER_CREATED = 'user_created', 'User Created'
        USER_UPDATED = 'user_updated', 'User Updated'
        USER_DELETED = 'user_deleted', 'User Deleted'
        ROLE_CHANGED = 'role_changed', 'Role Changed'
        COURSE_CREATED = 'course_created', 'Course Created'
        COURSE_APPROVED = 'course_approved', 'Course Approved'
        COURSE_REJECTED = 'course_rejected', 'Course Rejected'
        COURSE_DELETED = 'course_deleted', 'Course Deleted'
        COURSE_EDITED = 'course_edited', 'Course Edited'
        OWNERSHIP_TRANSFERRED = 'ownership_transferred', 'Ownership Transferred'
        WALLET_DEPOSIT = 'wallet_deposit', 'Wallet Deposit'
        WALLET_WITHDRAWAL = 'wallet_withdrawal', 'Wallet Withdrawal'
        PURCHASE = 'purchase', 'Purchase'
        REFUND = 'refund', 'Refund'
        RECHARGE_CODE_USED = 'recharge_code_used', 'Recharge Code Used'
        MANUAL_DEPOSIT = 'manual_deposit', 'Manual Deposit'
        QUIZ_ATTEMPT = 'quiz_attempt', 'Quiz Attempt'
        QUIZ_GRADED = 'quiz_graded', 'Quiz Graded'
        QUIZ_DELETED = 'quiz_deleted', 'Quiz Deleted'
        ADMIN_ACTION = 'admin_action', 'Admin Action'
        SYSTEM_EVENT = 'system_event', 'System Event'
    
    actor = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs',
        help_text='User who performed the action'
    )
    action_type = models.CharField(
        max_length=50,
        choices=ActionType.choices,
        db_index=True
    )
    description = models.TextField(
        help_text='Human-readable description of the action'
    )
    reason = models.TextField(
        blank=True,
        null=True,
        help_text='Optional reason for the action (required for some admin actions)'
    )
    object_type = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Type of object affected (e.g., "Course", "Payment", "Quiz")'
    )
    object_id = models.PositiveIntegerField(
        blank=True,
        null=True,
        help_text='ID of the object affected'
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text='Additional structured data about the action'
    )
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at', 'action_type'], name='users_audit_created_2a3805_idx'),
            models.Index(fields=['actor', '-created_at'], name='users_audit_actor_i_fea760_idx'),
            models.Index(fields=['object_type', 'object_id'], name='users_audit_object__f792c7_idx'),
        ]
    
    def __str__(self):
        actor_name = self.actor.email if self.actor else 'System'
        return f"{self.action_type} by {actor_name} at {self.created_at}"