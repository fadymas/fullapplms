"""
Signals for courses app.
"""
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.db import transaction
from users.audit import AuditLogger
from users.models import AuditLog
from .models import Course, Lecture, Enrollment, LectureProgress


@receiver(post_save, sender=Course)
def log_course_creation(sender, instance, created, **kwargs):
    """Log course creation and status changes."""
    if created:
        AuditLogger.log_course_action(
            actor=instance.instructor,
            action_type=AuditLog.ActionType.COURSE_CREATED,
            course=instance,
            description=f"Course '{instance.title}' created by {instance.instructor.email if instance.instructor else 'System'}",
            request=None
        )
    else:
        # Check if status changed by comparing with database
        try:
            original = Course.objects.get(pk=instance.pk)
            if original.status != instance.status:
                if instance.status == Course.Status.PUBLISHED:
                    AuditLogger.log_course_action(
                        actor=None,  # Admin action
                        action_type=AuditLog.ActionType.COURSE_APPROVED,
                        course=instance,
                        description=f"Course '{instance.title}' approved and published",
                        request=None
                    )
                elif instance.status == Course.Status.REJECTED:
                    AuditLogger.log_course_action(
                        actor=None,
                        action_type=AuditLog.ActionType.COURSE_REJECTED,
                        course=instance,
                        description=f"Course '{instance.title}' rejected: {instance.rejection_reason}",
                        reason=instance.rejection_reason,
                        request=None
                    )
        except Course.DoesNotExist:
            pass


@receiver(pre_save, sender=Course)
def handle_instructor_removal(sender, instance, **kwargs):
    """Transfer ownership to admin if instructor is removed."""
    if instance.pk:
        try:
            original = Course.objects.get(pk=instance.pk)
            if original.instructor and not instance.instructor:
                # Instructor removed - transfer to admin
                from django.contrib.auth import get_user_model
                User = get_user_model()
                admin = User.objects.filter(role='admin', is_active=True).first()
                if admin:
                    instance.instructor = admin
                    AuditLogger.log_course_action(
                        actor=None,
                        action_type=AuditLog.ActionType.OWNERSHIP_TRANSFERRED,
                        course=instance,
                        description=f"Course '{instance.title}' ownership transferred to admin",
                        reason="Instructor removed",
                        request=None
                    )
        except Course.DoesNotExist:
            pass


def recalculate_course_progress(course):
    """Recalculate progress for all students enrolled in a course."""
    enrollments = Enrollment.objects.filter(course=course)
    for enrollment in enrollments:
        enrollment.calculate_progress()


@receiver(post_delete, sender=Lecture)
def handle_lecture_deletion(sender, instance, **kwargs):
    """Recalculate progress when lecture is deleted."""
    recalculate_course_progress(instance.section.course)


@receiver(post_save, sender=LectureProgress)
def update_enrollment_progress(sender, instance, created, **kwargs):
    """Update enrollment progress when lecture progress changes."""
    if instance.completed:
        instance.enrollment.calculate_progress()

