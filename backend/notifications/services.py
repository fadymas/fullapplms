"""
Services for notifications app.
"""
from django.contrib.auth import get_user_model
from .models import Notification
from django.utils import timezone
from datetime import timedelta
from utils.safe_serialize import convert_decimals

User = get_user_model()


class NotificationService:
    """Service for notification operations."""
    
    @staticmethod
    def send_notification(user, title, message, notification_type, **kwargs):
        """Send a notification to a user."""
        # Normalize metadata and ensure JSON-safe values
        metadata = kwargs.get('metadata', {}) or {}
        safe_metadata = convert_decimals(metadata)

        # Deduplicate similar notifications created in a short window
        try:
            recent_window = timezone.now() - timedelta(seconds=2)
            dup_filter = {
                'user': user,
                'notification_type': notification_type,
            }
            # prefer related_transaction as strongest dedupe key
            if kwargs.get('related_transaction'):
                dup_filter['related_transaction'] = kwargs.get('related_transaction')
            elif kwargs.get('related_course'):
                dup_filter['related_course'] = kwargs.get('related_course')

            existing = Notification.objects.filter(**dup_filter, created_at__gte=recent_window).order_by('-created_at').first()
            if existing:
                return existing
        except Exception:
            pass

        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            is_important=kwargs.get('is_important', False),
            related_transaction=kwargs.get('related_transaction'),
            related_course=kwargs.get('related_course'),
            related_purchase=kwargs.get('related_purchase'),
            metadata=safe_metadata
        )
        return notification
    
    @staticmethod
    def send_wallet_recharge_notification(student, amount, transaction):
        """Send wallet recharge notification."""
        return NotificationService.send_notification(
            user=student,
            title='تم شحن محفظتك',
            message=f'تم إضافة {amount} جنيه إلى محفظتك بنجاح.',
            notification_type=Notification.NotificationType.WALLET_RECHARGE,
            related_transaction=transaction,
            metadata={'amount': str(amount)}
        )
    
    @staticmethod
    def send_purchase_notification(student, course, transaction):
        """Send course purchase notification."""
        return NotificationService.send_notification(
            user=student,
            title='تم شراء الكورس',
            message=f'تم شراء كورس "{course.title}" بنجاح.',
            notification_type=Notification.NotificationType.PURCHASE,
            related_transaction=transaction,
            related_course=course,
            metadata={
                'course_title': course.title,
                'amount': str(course.price)
            }
        )
    
    @staticmethod
    def send_refund_notification(student, amount, transaction):
        """Send refund notification."""
        return NotificationService.send_notification(
            user=student,
            title='تم استرداد المبلغ',
            message=f'تم استرداد {amount} جنيه إلى محفظتك.',
            notification_type=Notification.NotificationType.REFUND,
            related_transaction=transaction,
            metadata={'amount': str(amount)}
        )
    
    @staticmethod
    def send_security_notification(user, title, message, metadata=None):
        """Send security notification."""
        return NotificationService.send_notification(
            user=user,
            title=title,
            message=message,
            notification_type=Notification.NotificationType.SECURITY,
            is_important=True,
            metadata=metadata or {}
        )
    
    @staticmethod
    def send_system_notification(user, title, message):
        """Send system notification."""
        return NotificationService.send_notification(
            user=user,
            title=title,
            message=message,
            notification_type=Notification.NotificationType.SYSTEM
        )
    
    @staticmethod
    def get_unread_count(user):
        """Get count of unread notifications for a user."""
        return Notification.objects.filter(user=user, is_read=False).count()
    
    @staticmethod
    def get_unread_important_count(user):
        """Get count of unread important notifications."""
        return Notification.objects.filter(
            user=user, 
            is_read=False, 
            is_important=True
        ).count()
    
    @staticmethod
    def get_notification_stats(user):
        """Get notification statistics for a user."""
        notifications = Notification.objects.filter(user=user)
        
        total = notifications.count()
        unread = notifications.filter(is_read=False).count()
        unread_important = notifications.filter(
            is_read=False, 
            is_important=True
        ).count()
        
        by_type = {}
        for notification_type, _ in Notification.NotificationType.choices:
            count = notifications.filter(
                notification_type=notification_type
            ).count()
            by_type[notification_type] = count
        
        return {
            'total': total,
            'unread': unread,
            'unread_important': unread_important,
            'by_type': by_type
        }
    
    @staticmethod
    def cleanup_old_notifications(days=90):
        """Delete notifications older than specified days."""
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=days)
        deleted_count, _ = Notification.objects.filter(
            created_at__lt=cutoff_date,
            is_read=True,
            is_important=False
        ).delete()
        
        return deleted_count
    
    @staticmethod
    def batch_send_notifications(users, title, message, notification_type, **kwargs):
        """Send notification to multiple users."""
        notifications = []
        for user in users:
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                notification_type=notification_type,
                is_important=kwargs.get('is_important', False),
                metadata=kwargs.get('metadata', {})
            )
            notifications.append(notification)
        return notifications