"""
Serializers for reports app.
"""
from rest_framework import serializers


class TopCoursesReportSerializer(serializers.Serializer):
    """Serializer for top courses report."""
    
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    instructor_email = serializers.CharField()
    instructor_name = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_purchases = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    active_students = serializers.IntegerField()
    last_updated = serializers.DateTimeField()


class StudentActivityReportSerializer(serializers.Serializer):
    """Serializer for student activity report."""
    
    student_id = serializers.IntegerField()
    student_email = serializers.CharField()
    student_name = serializers.CharField()
    wallet_balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_deposits = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_withdrawals = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_purchases = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_refunds = serializers.DecimalField(max_digits=10, decimal_places=2)
    net_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    last_activity = serializers.DateTimeField(allow_null=True)


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


class InstructorRevenueReportSerializer(serializers.Serializer):
    """Serializer for instructor revenue report."""
    
    instructor_id = serializers.IntegerField()
    instructor_email = serializers.CharField()
    instructor_name = serializers.CharField()
    total_courses = serializers.IntegerField()
    total_purchases = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_students = serializers.IntegerField()
    courses = serializers.ListField()
    recent_sales = serializers.ListField()
    monthly_revenue = serializers.ListField()


class FailedTransactionsReportSerializer(serializers.Serializer):
    """Serializer for failed transactions report."""
    
    summary = serializers.DictField()
    by_ip = serializers.ListField()
    recent_failed = serializers.ListField()