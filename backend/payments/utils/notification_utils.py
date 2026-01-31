"""
Utilities for notification operations.
"""
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationUtils:
    """Utility class for notification operations."""
    
    @staticmethod
    def format_notification_message(notification_type, data):
        """Format notification message based on type."""
        messages = {
            'wallet_recharge': {
                'title': 'تم شحن محفظتك',
                'message': f"تم إضافة {data.get('amount', 0)} جنيه إلى محفظتك بنجاح."
            },
            'purchase': {
                'title': 'تم شراء الكورس',
                'message': f"تم شراء كورس '{data.get('course_title', '')}' بنجاح."
            },
            'refund': {
                'title': 'تم استرداد المبلغ',
                'message': f"تم استرداد {data.get('amount', 0)} جنيه إلى محفظتك."
            },
            'manual_deposit': {
                'title': 'إيداع يدوي',
                'message': f"تم إيداع {data.get('amount', 0)} جنيه إلى محفظتك من قبل المسؤول."
            },
            'recharge_code_used': {
                'title': 'تم استخدام كود الشحن',
                'message': f"تم استخدام كود الشحن بنجاح وتم إضافة {data.get('amount', 0)} جنيه."
            },
            'suspicious_activity': {
                'title': 'نشاط مشبوه',
                'message': 'تم اكتشاف نشاط مشبوه على حسابك. يرجى مراجعة المعاملات.'
            }
        }
        
        return messages.get(notification_type, {
            'title': 'إشعار جديد',
            'message': 'لديك إشعار جديد.'
        })
    
    @staticmethod
    def get_user_preferences(user):
        """Get user notification preferences."""
        # Default preferences
        preferences = {
            'in_app': True,
            'email': False,
            'push': False,
            'sms': False,
            'types': ['wallet_recharge', 'purchase', 'refund']
        }
        
        # In future, could be stored in database
        return preferences
    
    @staticmethod
    def should_send_notification(user, notification_type):
        """Check if notification should be sent to user."""
        preferences = NotificationUtils.get_user_preferences(user)
        
        # Check if user wants this type of notification
        if notification_type not in preferences['types']:
            return False
        
        # Check if user wants in-app notifications
        if not preferences['in_app']:
            return False
        
        return True
    
    @staticmethod
    def mark_notifications_as_read(user, notification_ids=None):
        """Mark notifications as read."""
        from notifications.models import Notification
        
        if notification_ids:
            # Mark specific notifications
            Notification.objects.filter(
                user=user,
                id__in=notification_ids,
                is_read=False
            ).update(is_read=True)
        else:
            # Mark all notifications
            Notification.objects.filter(
                user=user,
                is_read=False
            ).update(is_read=True)
    
    @staticmethod
    def get_unread_count(user):
        """Get count of unread notifications for user."""
        from notifications.models import Notification
        return Notification.objects.filter(user=user, is_read=False).count()
    
    @staticmethod
    def cleanup_old_notifications(days=30):
        """Delete notifications older than specified days."""
        from django.utils import timezone
        from notifications.models import Notification
        
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        deleted_count, _ = Notification.objects.filter(
            created_at__lt=cutoff_date,
            is_read=True
        ).delete()
        
        return deleted_count