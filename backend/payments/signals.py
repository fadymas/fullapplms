"""
Signals for payments app.
Updated with signals for new models and business logic.
"""
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    Wallet, Transaction, Purchase, RechargeCode,
    CourseStats, PriceHistory, PaymentLog
)

from .services import (
    CourseStatsService, PriceHistoryService,
    PaymentLogService
)

User = get_user_model()


# ==================== USER SIGNALS ====================

@receiver(post_save, sender=User)
def create_wallet_for_student(sender, instance, created, **kwargs):
    """Create wallet when student is created."""
    if created and instance.role == 'student':
        Wallet.objects.get_or_create(student=instance)


# ==================== COURSE SIGNALS ====================

@receiver(pre_save, sender='courses.Course')  # Using string reference to avoid circular import
def record_price_change(sender, instance, **kwargs):
    """Record price changes for courses."""
    if instance.pk:  # Only for existing courses
        try:
            from courses.models import Course
            old_course = Course.objects.get(pk=instance.pk)
            if old_course.price != instance.price:
                PriceHistoryService.record_price_change(
                    course=instance,
                    old_price=old_course.price,
                    new_price=instance.price,
                    changed_by=instance.instructor,
                    reason="Price update"
                )
        except Course.DoesNotExist:
            pass


@receiver(post_save, sender='courses.Course')
def create_course_stats(sender, instance, created, **kwargs):
    """Create course stats when a course is created."""
    if created:
        CourseStats.objects.get_or_create(course=instance)


# ==================== PURCHASE SIGNALS ====================

@receiver(post_save, sender=Purchase)
def update_course_stats_on_purchase(sender, instance, created, **kwargs):
    """Update course statistics when purchase is made or refunded."""
    if created or instance.refunded:
        CourseStatsService.update_course_stats(instance.course)
        
        # Send notification based on action
        from notifications.services import NotificationService
        if created:
            NotificationService.send_purchase_notification(
                instance.student,
                instance.course,
                instance.transaction
            )
        elif instance.refunded:
            NotificationService.send_refund_notification(
                instance.student,
                instance.amount,
                instance.transaction
            )


@receiver(post_save, sender=Purchase)
def log_purchase_action(sender, instance, created, **kwargs):
    """Log purchase creation or refund."""
    if created:
        PaymentLogService.log_purchase(
            actor=instance.student,
            student=instance.student,
            course=instance.course,
            amount=instance.amount,
            transaction=instance.transaction
        )
    elif 'refunded' in instance.get_dirty_fields() and instance.refunded:
        PaymentLogService.log_refund(
            actor=None,  # Will be set by the service
            student=instance.student,
            course=instance.course,
            amount=instance.amount,
            transaction=instance.transaction,
            reason=instance.refund_reason
        )


# ==================== TRANSACTION SIGNALS ====================

@receiver(post_save, sender=Transaction)
def log_transaction_creation(sender, instance, created, **kwargs):
    """Log transaction creation."""
    if created:
        # Determine action based on transaction type
        action_map = {
            Transaction.TransactionType.DEPOSIT: 'deposit',
            Transaction.TransactionType.WITHDRAWAL: 'withdrawal',
            Transaction.TransactionType.PURCHASE: 'purchase',
            Transaction.TransactionType.REFUND: 'refund',
            Transaction.TransactionType.RECHARGE_CODE: 'recharge_code_used',
            Transaction.TransactionType.MANUAL_DEPOSIT: 'manual_deposit',
        }
        
        action = action_map.get(instance.transaction_type, 'unknown')
        
        PaymentLogService.create_log(
            actor=instance.created_by,
            action=action,
            student=instance.wallet.student,
            amount=instance.amount,
            transaction=instance
        )
        
        # Send notification for certain transaction types
        from notifications.services import NotificationService
        if instance.transaction_type in [
            Transaction.TransactionType.RECHARGE_CODE,
            Transaction.TransactionType.MANUAL_DEPOSIT
        ]:
            NotificationService.send_wallet_recharge_notification(
                instance.wallet.student,
                instance.amount,
                instance
            )


# ==================== RECHARGE CODE SIGNALS ====================

@receiver(post_save, sender=RechargeCode)
def log_recharge_code_usage(sender, instance, **kwargs):
    """Log when recharge code is marked as used."""
    if 'is_used' in instance.get_dirty_fields() and instance.is_used:
        PaymentLogService.log_recharge(
            actor=instance.used_by,
            student=instance.used_by,
            amount=instance.amount,
            code=instance.code,
            transaction=None  # Will be linked by the service
        )


# ==================== COURSE STATS SIGNALS ====================

@receiver(post_save, sender=CourseStats)
def log_course_stats_update(sender, instance, created, **kwargs):
    """Log when course stats are updated."""
    if not created:  # Only log updates, not initial creation
        dirty_fields = instance.get_dirty_fields()
        if any(field in dirty_fields for field in ['total_purchases', 'total_revenue', 'active_students']):
            PaymentLogService.create_log(
                actor=None,  # System action
                action='course_stats_updated',
                course=instance.course,
                metadata={
                    'total_purchases': instance.total_purchases,
                    'total_revenue': str(instance.total_revenue),
                    'active_students': instance.active_students,
                    'changes': dirty_fields
                }
            )


# ==================== PRICE HISTORY SIGNALS ====================

@receiver(post_save, sender=PriceHistory)
def notify_price_change(sender, instance, created, **kwargs):
    """Send notification about price change."""
    if created:
        # In future: notify enrolled students about price changes
        # For now, just log it
        PaymentLogService.log_price_change(
            actor=instance.changed_by,
            course=instance.course,
            old_price=instance.old_price,
            new_price=instance.new_price,
            reason=instance.reason
        )


# ==================== PAYMENT LOG SIGNALS ====================

@receiver(post_save, sender=PaymentLog)
def check_suspicious_activity(sender, instance, created, **kwargs):
    """Check for suspicious activities in payment logs."""
    if created:
        from .services import SuspiciousActivityService
        
        suspicious_actions = [
            'suspicious_recharge_attempts',
            'suspicious_purchase_rate'
        ]
        
        if instance.action in suspicious_actions:
            # Log to file for monitoring
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(
                f"Suspicious activity detected: {instance.action} - "
                f"Student: {instance.student.email if instance.student else 'N/A'} - "
                f"IP: {instance.ip_address} - "
                f"Metadata: {instance.metadata}"
            )


# ==================== CLEANUP SIGNALS ====================

@receiver(post_delete, sender=User)
def cleanup_wallet_on_user_delete(sender, instance, **kwargs):
    """Clean up wallet when user is deleted."""
    if hasattr(instance, 'wallet'):
        instance.wallet.delete()


@receiver(post_delete, sender='courses.Course')
def cleanup_course_stats_on_delete(sender, instance, **kwargs):
    """Clean up course stats when course is deleted."""
    CourseStats.objects.filter(course=instance).delete()
    PriceHistory.objects.filter(course=instance).delete()


# ==================== HELPER FUNCTIONS ====================

def update_all_course_stats():
    """Update statistics for all courses."""
    CourseStatsService.update_all_stats()


def cleanup_old_payment_logs(days=90):
    """Delete payment logs older than specified days."""
    cutoff_date = timezone.now() - timezone.timedelta(days=days)
    deleted_count, _ = PaymentLog.objects.filter(
        created_at__lt=cutoff_date
    ).delete()
    return deleted_count