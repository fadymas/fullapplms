"""
Notifications app models.
"""
from django.db import models
from django.contrib.auth import get_user_model
from utils.dirtyfields import DirtyFieldsMixin
from django.utils import timezone

User = get_user_model()


class Notification(DirtyFieldsMixin, models.Model):
    """Notification model for in-app notifications."""
    class NotificationType(models.TextChoices):
        WALLET_RECHARGE = 'wallet_recharge', 'Wallet Recharge'
        PURCHASE = 'purchase', 'Course Purchase'
        REFUND = 'refund', 'Refund'
        SYSTEM = 'system', 'System Notification'
        SECURITY = 'security', 'Security Alert'
        PROMOTION = 'promotion', 'Promotion'
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM
    )
    is_read = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    
    # Related objects
    related_transaction = models.ForeignKey(
        'payments.Transaction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    related_course = models.ForeignKey(
        'courses.Course',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    related_purchase = models.ForeignKey(
        'payments.Purchase',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', 'created_at']),
            models.Index(fields=['notification_type', 'created_at']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    def mark_as_read(self, save=True):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            # set timestamp (not a Field instance)
            self.read_at = timezone.now()
            if save:
                self.save(update_fields=['is_read', 'read_at'])
    
    def mark_as_unread(self, save=True):
        """Mark notification as unread."""
        if self.is_read:
            self.is_read = False
            self.read_at = None
            if save:
                self.save(update_fields=['is_read', 'read_at'])
    
    @classmethod
    def mark_all_as_read(cls, user):
        """Mark all notifications as read for a user."""
        from django.utils import timezone
        return cls.objects.filter(user=user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
    
    @classmethod
    def get_unread_count(cls, user):
        """Get count of unread notifications for a user."""
        return cls.objects.filter(user=user, is_read=False).count()
    
    @classmethod
    def create_notification(cls, user, title, message, notification_type, **kwargs):
        """Create a notification with related objects."""
        return cls.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            is_important=kwargs.get('is_important', False),
            related_transaction=kwargs.get('related_transaction'),
            related_course=kwargs.get('related_course'),
            related_purchase=kwargs.get('related_purchase'),
            metadata=kwargs.get('metadata', {})
        )