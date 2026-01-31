"""
Serializers for notifications app.
"""
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_email', 'user_name',
            'title', 'message', 'notification_type', 'notification_type_display',
            'is_read', 'is_important', 'related_transaction', 'related_course',
            'related_purchase', 'metadata', 'created_at', 'read_at'
        ]
        read_only_fields = ['created_at', 'read_at']


class NotificationCountSerializer(serializers.Serializer):
    """Serializer for notification counts."""
    total = serializers.IntegerField()
    unread = serializers.IntegerField()
    unread_important = serializers.IntegerField()
    by_type = serializers.DictField()


class MarkAsReadSerializer(serializers.Serializer):
    """Serializer for marking notifications as read."""
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of notification IDs to mark as read. If empty, marks all."
    )
    
    def validate_notification_ids(self, value):
        if value:
            # Check that all notifications belong to the user
            from .models import Notification
            user = self.context['request'].user
            notification_count = Notification.objects.filter(
                id__in=value,
                user=user
            ).count()
            
            if notification_count != len(value):
                raise serializers.ValidationError(
                    "Some notifications do not exist or do not belong to you."
                )
        return value