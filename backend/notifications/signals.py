"""
Signals for notifications app.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Notification


@receiver(post_save, sender=Notification)
def log_notification_creation(sender, instance, created, **kwargs):
    """Log notification creation."""
    if created:
        # Log to audit system (if exists)
        import logging
        logger = logging.getLogger('notifications')
        logger.info(
            f"Notification created: {instance.notification_type} - "
            f"User: {instance.user.email} - "
            f"Title: {instance.title}"
        )


@receiver(post_save, sender=Notification)
def update_read_timestamp(sender, instance, **kwargs):
    """Update read_at timestamp when notification is marked as read."""
    if 'is_read' in instance.get_dirty_fields() and instance.is_read:
        instance.read_at = timezone.now()
        # Save without triggering signals again
        Notification.objects.filter(pk=instance.pk).update(read_at=instance.read_at)