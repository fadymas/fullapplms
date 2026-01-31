"""
Serializers for dashboard app.
"""
from rest_framework import serializers


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    
    overview = serializers.DictField()
    today = serializers.DictField(required=False)
    weekly_data = serializers.ListField(required=False)
    monthly_data = serializers.ListField(required=False)
    top_courses = serializers.ListField(required=False)
    user_stats = serializers.DictField(required=False)
    recharge_stats = serializers.DictField(required=False)
    suspicious_activities = serializers.ListField(required=False)
    student_stats = serializers.DictField(required=False)
    course_performance = serializers.ListField(required=False)
    recent_purchases = serializers.ListField(required=False)
    wallet = serializers.DictField(required=False)
    spending = serializers.DictField(required=False)
    transaction_summary = serializers.DictField(required=False)
    course_progress = serializers.ListField(required=False)
    monthly_spending = serializers.ListField(required=False)
    recent_transactions = serializers.ListField(required=False)


class FilterOptionSerializer(serializers.Serializer):
    """Serializer for filter options."""
    
    instructors = serializers.ListField(required=False)
    courses = serializers.ListField(required=False)
    students = serializers.ListField(required=False)
    my_courses = serializers.ListField(required=False)
    date_ranges = serializers.ListField(required=False)


class DateRangeSerializer(serializers.Serializer):
    """Serializer for date range selection."""
    
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    period = serializers.CharField(required=False)
    
    def validate(self, data):
        """Validate date range."""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        period = data.get('period')
        # If no date filters provided, default to last month to provide
        # a useful dashboard view instead of raising a validation error.
        if not any([start_date, end_date, period]):
            data['period'] = 'month'
            period = 'month'
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                "start_date must be before end_date."
            )
        
        return data