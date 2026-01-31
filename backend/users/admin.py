# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import CustomUser, StudentProfile, TeacherAdminProfile


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Admin configuration for CustomUser model."""
    list_display = ("email", "role", "is_active", "is_staff", "last_login", "date_joined")
    list_filter = ("role", "is_active", "is_staff", "email_verified", "date_joined")
    search_fields = ("email",)
    ordering = ("-date_joined",)
    readonly_fields = ("last_login", "date_joined")
    
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("role",)}),
        ("Status", {"fields": ("is_active", "is_staff", "email_verified")}),
        ("Timestamps", {"fields": ("last_login", "date_joined")}),
        ("Permissions", {
            "fields": ("is_superuser", "groups", "user_permissions"),
            "classes": ("collapse",)
        }),
    )
    
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "role", "password1", "password2", 
                      "is_active", "is_staff", "email_verified"),
        }),
    )


class BaseProfileAdmin(admin.ModelAdmin):
    """Base admin for profile models."""
    list_select_related = ('user',)
    raw_id_fields = ('user',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(StudentProfile)
class StudentProfileAdmin(BaseProfileAdmin):
    list_display = ("full_name", "user_email", "grade", "created_at")
    search_fields = ("first_name", "last_name", "user__email", "grade")
    list_filter = ("grade", "created_at")
    
    fieldsets = (
        (None, {"fields": ("user",)}),
        ("Personal Information", {
            "fields": ("full_name", "grade")
        }),
        ("Contact Information", {
            "fields": ("phone", "guardian_phone")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    def get_form(self, request, obj=None, **kwargs):
        """Override to exclude password field if it somehow gets included."""
        form = super().get_form(request, obj, **kwargs)
        if 'password' in form.base_fields:
            del form.base_fields['password']
        return form
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "Email"
    user_email.admin_order_field = "user__email"

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = "Full Name"
    full_name.admin_order_field = "last_name"


@admin.register(TeacherAdminProfile)
class TeacherAdminProfileAdmin(BaseProfileAdmin):
    list_display = ("full_name", "user_email", "specialization", "created_at")
    search_fields = ("first_name", "last_name", "user__email", "specialization")
    list_filter = ("gender", "created_at")
    
    fieldsets = (
        (None, {"fields": ("user",)}),
        ("Personal Information", {
            "fields": ("first_name", "last_name", "date_of_birth", "gender")
        }),
        ("Professional Information", {
            "fields": ("specialization", "bio")
        }),
        ("Contact Information", {
            "fields": ("phone",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
    
    def get_form(self, request, obj=None, **kwargs):
        """Override to exclude password field if it somehow gets included."""
        form = super().get_form(request, obj, **kwargs)
        if 'password' in form.base_fields:
            del form.base_fields['password']
        return form
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "Email"
    user_email.admin_order_field = "user__email"
    
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = "Full Name"
    full_name.admin_order_field = "last_name"