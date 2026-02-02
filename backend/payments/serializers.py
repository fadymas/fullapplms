"""
Serializers for payments app.
Updated with new models and enhanced serializers.
"""
from rest_framework import serializers
from django.db import transaction as db_transaction
from decimal import Decimal
import json
from .models import (
    Wallet, Transaction, Purchase, RechargeCode,
    CourseStats, PriceHistory, PaymentLog
)


class DecimalToStringField(serializers.Field):
    """Custom field to convert Decimal to string."""
    
    def __init__(self, **kwargs):
        # ?????? min_value ? max_value ?? kwargs ??????? (???? ??????? ??? Decimal)
        min_value = kwargs.pop('min_value', None)
        max_value = kwargs.pop('max_value', None)
        self.min_value = Decimal(str(min_value)) if min_value is not None else None
        self.max_value = Decimal(str(max_value)) if max_value is not None else None
        super().__init__(**kwargs)
    
    def to_representation(self, value):
        return str(value) if value is not None else None
    
    def to_internal_value(self, data):
        if data is None:
            return None
        
        try:
            # ????? ?????? ??? Decimal
            decimal_value = Decimal(str(data))
            
            # ?????? ?? min_value
            if self.min_value is not None and decimal_value < self.min_value:
                raise serializers.ValidationError(
                    f"Ensure this value is greater than or equal to {self.min_value}."
                )
            
            # ?????? ?? max_value
            if self.max_value is not None and decimal_value > self.max_value:
                raise serializers.ValidationError(
                    f"Ensure this value is less than or equal to {self.max_value}."
                )
            
            return decimal_value
        except (ValueError, TypeError):
            raise serializers.ValidationError("Invalid decimal value.")


class DecimalFieldWithValidation(serializers.DecimalField):
    """Decimal field that converts to string for representation."""
    
    def __init__(self, **kwargs):
        # Ensure defaults
        if 'max_digits' not in kwargs:
            kwargs['max_digits'] = 10
        if 'decimal_places' not in kwargs:
            kwargs['decimal_places'] = 2
        super().__init__(**kwargs)
    
    def to_representation(self, value):
        if value is None:
            return None
        parent_value = super().to_representation(value)
        return str(parent_value)
    
    def to_internal_value(self, data):
        return super().to_internal_value(data)


class WalletSerializer(serializers.ModelSerializer):
    balance = DecimalToStringField(read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_phone = serializers.CharField(source='student.student_profile.phone', read_only=True)
    
    class Meta:
        model = Wallet
        fields = [
            'id', 'student', 'student_email', 'student_name', 'student_phone',
            'balance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display',
        read_only=True
    )
    payment_method_display = serializers.CharField(
        source='get_payment_method_display',
        read_only=True
    )
    student_email = serializers.CharField(source='wallet.student.email', read_only=True)
    student_name = serializers.CharField(source='wallet.student.get_full_name', read_only=True)
    amount = DecimalToStringField(read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'wallet', 'student_email', 'student_name',
            'transaction_type', 'transaction_type_display',
            'payment_method', 'payment_method_display',
            'amount', 'description', 'reason',
            'purchase', 'recharge_code',
            'created_at', 'created_by'
        ]
        read_only_fields = ['created_at']


class DecimalJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles Decimal objects."""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super().default(obj)


class DecimalSerializerMixin:
    """Mixin to ensure Decimal fields are properly serialized."""
    def to_representation(self, instance):
        data = super().to_representation(instance)
        def convert_decimals(obj):
            if isinstance(obj, Decimal):
                return str(obj)
            elif isinstance(obj, dict):
                return {k: convert_decimals(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_decimals(item) for item in obj]
            else:
                return obj
        return convert_decimals(data)






class RechargeCodeSerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    used_by_email = serializers.CharField(source='used_by.email', read_only=True)
    used_by_name = serializers.CharField(source='used_by.get_full_name', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    # Make amount writable and validated
    amount = DecimalFieldWithValidation(max_digits=10, decimal_places=2)
    
    class Meta:
        model = RechargeCode
        fields = [
            'id', 'code', 'amount', 'is_used', 'is_valid',
            'used_by', 'used_by_email', 'used_by_name',
            'used_at', 'created_at', 'expires_at',
            'created_by', 'created_by_email'
        ]
        read_only_fields = ['is_used', 'used_by', 'used_at', 'created_at', 'is_valid']
    
    def validate_code(self, value):
        """Ensure code is unique and not already used."""
        if RechargeCode.objects.filter(code=value, is_used=True).exists():
            raise serializers.ValidationError('This code has already been used.')
        return value


class BulkRechargeCodeSerializer(serializers.Serializer):
    """Serializer for bulk recharge code generation."""
    amount = DecimalFieldWithValidation(
        max_digits=10, 
        decimal_places=2, 
        min_value=Decimal('0.01')
    )
    count = serializers.IntegerField(min_value=1, max_value=1000)
    prefix = serializers.CharField(max_length=20, required=False, allow_blank=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)
    
    def create(self, validated_data):
        """Create multiple recharge codes."""
        from .services import BulkRechargeService
        return BulkRechargeService.generate_codes(**validated_data)


class ManualDepositSerializer(serializers.Serializer):
    """Serializer for manual deposit by admin."""
    amount = DecimalFieldWithValidation(
        max_digits=10, 
        decimal_places=2, 
        min_value=Decimal('0.01')
    )
    reason = serializers.CharField(max_length=500, required=True)
    student_id = serializers.IntegerField(required=True)
    
    def validate_student_id(self, value):
        """Validate student exists and is actually a student."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            student = User.objects.get(id=value, role='student')
        except User.DoesNotExist:
            raise serializers.ValidationError('Student not found.')
        return value


class UseRechargeCodeSerializer(serializers.Serializer):
    """Serializer for using a recharge code."""
    code = serializers.CharField(max_length=50, required=True)
    
    def validate_code(self, value):
        """Validate recharge code."""
        from .models import RechargeCode
        try:
            recharge_code = RechargeCode.objects.get(code=value)
            if not recharge_code.is_valid():
                raise serializers.ValidationError('Recharge code is invalid or already used.')
        except RechargeCode.DoesNotExist:
            raise serializers.ValidationError('Invalid recharge code.')
        return value


class PurchaseCourseSerializer(serializers.Serializer):
    """Serializer for purchasing a course."""
    course_id = serializers.IntegerField(required=True)
    
    def validate_course_id(self, value):
        """Validate course exists."""
        from courses.models import Course
        try:
            course = Course.objects.get(id=value)
        except Course.DoesNotExist:
            raise serializers.ValidationError('Course not found.')
        return value


class RefundPurchaseSerializer(serializers.Serializer):
    """Serializer for refunding a purchase."""
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)


# ==================== NEW SERIALIZERS ====================

class CourseStatsSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_instructor = serializers.CharField(
        source='course.instructor.get_full_name',
        read_only=True
    )
    course_price = DecimalToStringField(source='course.price', read_only=True)
    total_revenue = DecimalToStringField(read_only=True)
    
    class Meta:
        model = CourseStats
        fields = [
            'id', 'course', 'course_title', 'course_instructor', 'course_price',
            'total_purchases', 'total_revenue', 'active_students',
            'last_updated'
        ]
        read_only_fields = fields


class PriceHistorySerializer(serializers.ModelSerializer):
    changed_by_email = serializers.CharField(source='changed_by.email', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    price_difference = DecimalToStringField(read_only=True)
    old_price = DecimalToStringField(read_only=True)
    new_price = DecimalToStringField(read_only=True)
    
    class Meta:
        model = PriceHistory
        fields = [
            'id', 'course', 'course_title',
            'old_price', 'new_price', 'price_difference',
            'changed_by', 'changed_by_email', 'changed_by_name',
            'changed_at', 'reason'
        ]
        read_only_fields = fields


class PaymentLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source='actor.email', read_only=True)
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    amount = DecimalToStringField(read_only=True, allow_null=True)
    
    class Meta:
        model = PaymentLog
        fields = [
            'id', 'actor', 'actor_email', 'actor_name', 'action',
            'amount', 'student', 'student_email', 'student_name',
            'course', 'course_title', 'transaction',
            'ip_address', 'user_agent', 'session_id',
            'metadata', 'created_at'
        ]
        read_only_fields = fields


class InstructorRevenueSerializer(serializers.Serializer):
    """Serializer for instructor revenue report."""
    instructor_id = serializers.IntegerField()
    instructor_email = serializers.EmailField()
    instructor_name = serializers.CharField()
    total_courses = serializers.IntegerField()
    total_purchases = serializers.IntegerField()
    total_revenue = DecimalToStringField()
    total_students = serializers.IntegerField()
    courses = serializers.ListField()


class StudentActivitySerializer(serializers.Serializer):
    """Serializer for student activity report."""
    student_id = serializers.IntegerField()
    student_email = serializers.EmailField()
    student_name = serializers.CharField()
    wallet_balance = DecimalToStringField()
    total_deposits = DecimalToStringField()
    total_withdrawals = DecimalToStringField()
    total_purchases = serializers.IntegerField()
    total_spent = DecimalToStringField()
    total_refunds = DecimalToStringField()
    net_spent = DecimalToStringField()
    last_activity = serializers.DateTimeField(allow_null=True)


class TopCoursesSerializer(serializers.Serializer):
    """Serializer for top courses report."""
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    instructor_email = serializers.EmailField()
    instructor_name = serializers.CharField()
    price = DecimalToStringField()
    total_purchases = serializers.IntegerField()
    total_revenue = DecimalToStringField()
    active_students = serializers.IntegerField()
    last_updated = serializers.DateTimeField()


class RechargeCodeReportSerializer(serializers.Serializer):
    """Serializer for recharge code report."""
    summary = serializers.DictField()
    usage_by_creator = serializers.ListField()
    recent_usage = serializers.ListField()


class RefundReportSerializer(serializers.Serializer):
    """Serializer for refund report."""
    summary = serializers.DictField()
    by_course = serializers.ListField()
    by_student = serializers.ListField()
    recent_refunds = serializers.ListField()


class FailedTransactionsReportSerializer(serializers.Serializer):
    """Serializer for failed transactions report."""
    summary = serializers.DictField()
    by_ip = serializers.ListField()
    recent_failed = serializers.ListField()


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    overview = serializers.DictField()
    today = serializers.DictField(required=False)
    weekly_data = serializers.ListField(required=False)
    monthly_data = serializers.ListField(required=False)
    top_courses = serializers.ListField(required=False)
    recent_transactions = serializers.ListField(required=False)
    suspicious_activities = serializers.ListField(required=False)
    recharge_stats = serializers.DictField(required=False)
    courses = serializers.ListField(required=False)
    recent_purchases = serializers.ListField(required=False)
    monthly_revenue = serializers.ListField(required=False)
    wallet = serializers.DictField(required=False)
    spending = serializers.DictField(required=False)
    monthly_spending = serializers.ListField(required=False)


class PurchaseSerializer(DecimalSerializerMixin, serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_instructor = serializers.CharField(
        source='course.instructor.get_full_name',
        read_only=True
    )
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    transaction_id = serializers.IntegerField(source='transaction.id', read_only=True)
    amount = DecimalToStringField(read_only=True)
    price_at_purchase = DecimalToStringField(read_only=True)
    
    class Meta:
        model = Purchase
        fields = [
            'id', 'student', 'student_email', 'student_name',
            'course', 'course_title', 'course_instructor',
            'amount', 'price_at_purchase',
            'transaction', 'transaction_id',
            'purchased_at', 'refunded', 'refunded_at', 'refund_reason'
        ]
        read_only_fields = [
            'purchased_at', 'refunded', 'refunded_at',
            'refund_reason', 'amount', 'price_at_purchase', 'transaction'
        ]