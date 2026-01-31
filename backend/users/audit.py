"""
Audit logging utility for the LMS platform.
All apps should use this module to log critical actions.
"""
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import AuditLog

User = get_user_model()


class AuditLogger:
    """Centralized audit logging service."""
    
    @staticmethod
    def log_action(
        actor,
        action_type: str,
        description: str,
        reason: str = None,
        object_type: str = None,
        object_id: int = None,
        metadata: dict = None,
        request=None
    ) -> AuditLog:
        """
        Log an action to the audit log.
        
        Args:
            actor: User who performed the action (can be None for system actions)
            action_type: Type of action (from AuditLog.ActionType)
            description: Human-readable description
            reason: Optional reason for the action
            object_type: Type of object affected (e.g., 'Course', 'Payment')
            object_id: ID of the object affected
            metadata: Additional structured data
            request: Django request object (for IP and user agent)
        
        Returns:
            AuditLog instance
        """
        # Extract IP and user agent from request if provided
        ip_address = None
        user_agent = None
        if request:
            ip_address = get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')[:255]
        
        with transaction.atomic():
            log_entry = AuditLog.objects.create(
                actor=actor if actor and actor.is_authenticated else None,
                action_type=action_type,
                description=description,
                reason=reason,
                object_type=object_type,
                object_id=object_id,
                metadata=metadata or {},
                ip_address=ip_address,
                user_agent=user_agent
            )
        
        return log_entry
    
    @staticmethod
    def log_user_action(actor, action_type: str, target_user, description: str, reason: str = None, request=None):
        """Log a user-related action."""
        return AuditLogger.log_action(
            actor=actor,
            action_type=action_type,
            description=description,
            reason=reason,
            object_type='User',
            object_id=target_user.id if target_user else None,
            metadata={'target_user_email': target_user.email if target_user else None},
            request=request
        )
    
    @staticmethod
    def log_course_action(actor, action_type: str, course, description: str, reason: str = None, request=None):
        """Log a course-related action."""
        return AuditLogger.log_action(
            actor=actor,
            action_type=action_type,
            description=description,
            reason=reason,
            object_type='Course',
            object_id=course.id if course else None,
            metadata={'course_title': course.title if course else None},
            request=request
        )
    
    @staticmethod
    def log_payment_action(actor, action_type: str, transaction, description: str, reason: str = None, request=None):
        """Log a payment-related action."""
        return AuditLogger.log_action(
            actor=actor,
            action_type=action_type,
            description=description,
            reason=reason,
            object_type='Transaction',
            object_id=transaction.id if transaction else None,
            metadata={
                'amount': str(transaction.amount) if transaction else None,
                'transaction_type': transaction.transaction_type if transaction else None,
            },
            request=request
        )
    
    @staticmethod
    def log_quiz_action(actor, action_type: str, quiz_attempt, description: str, reason: str = None, request=None):
        """Log a quiz-related action."""
        return AuditLogger.log_action(
            actor=actor,
            action_type=action_type,
            description=description,
            reason=reason,
            object_type='QuizAttempt',
            object_id=quiz_attempt.id if quiz_attempt else None,
            metadata={
                'quiz_id': quiz_attempt.quiz.id if quiz_attempt and quiz_attempt.quiz else None,
                'score': str(quiz_attempt.score) if quiz_attempt else None,
            },
            request=request
        )


def get_client_ip(request):
    """Extract client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

