"""
إشارات تطبيق الكويزات
معالجة الأحداث التلقائية
"""

from django.db.models.signals import post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.db import transaction

from users.audit import AuditLogger
from users.models import AuditLog
from .models import Quiz, QuizAttempt, Answer


@receiver(pre_delete, sender=Quiz)
def log_quiz_deletion(sender, instance, **kwargs):
    """
    تسجيل حذف كويز
    """
    try:
        AuditLogger.log_action(
            actor=None,  # يمكن تمرير المستخدم من الـ request إذا كان متاحاً
            action_type=AuditLog.ActionType.QUIZ_DELETED,
            description=f"تم حذف كويز: {instance.title}",
            object_type='Quiz',
            object_id=instance.id,
            request=None
        )
    except Exception as e:
        # لا نريد أن يفشل الحذف إذا فشل التسجيل
        pass


@receiver(post_save, sender=QuizAttempt)
def handle_quiz_attempt_save(sender, instance, created, **kwargs):
    """
    معالجة حفظ محاولة كويز
    """
    if created:
        # محاولة جديدة
        try:
            AuditLogger.log_quiz_action(
                actor=instance.student,
                action_type=AuditLog.ActionType.QUIZ_ATTEMPT_STARTED,
                quiz_attempt=instance,
                description=f"بدأ محاولة كويز جديدة: {instance.quiz.title}",
                request=None
            )
        except Exception:
            pass


@receiver(post_save, sender=Answer)
def handle_answer_save(sender, instance, created, **kwargs):
    """
    معالجة حفظ إجابة
    """
    if created and instance.attempt.status == QuizAttempt.Status.IN_PROGRESS:
        # إجابة جديدة في محاولة قيد التنفيذ
        try:
            # تحديث وقت التعديل الأخير للمحاولة
            instance.attempt.save(update_fields=['updated_at'])
        except Exception:
            pass


@receiver(pre_delete, sender=Answer)
def handle_answer_delete(sender, instance, **kwargs):
    """
    معالجة حذف إجابة
    """
    try:
        # تسجيل الحذف في سجلات التدقيق
        AuditLogger.log_action(
            actor=None,
            action_type=AuditLog.ActionType.ANSWER_DELETED,
            description=f"تم حذف إجابة لسؤال: {instance.question.text[:50]}",
            object_type='Answer',
            object_id=instance.id,
            request=None
        )
    except Exception:
        pass