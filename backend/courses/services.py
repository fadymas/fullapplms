"""
Business logic services for courses app.
"""
from django.db import transaction
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from users.audit import AuditLogger
from users.models import AuditLog
from .models import Course, Section, Lecture, Enrollment

User = get_user_model()


class CourseService:
    """Service for course-related operations."""
    
    @staticmethod
    @transaction.atomic
    def create_course(instructor, data):
        """Create a new course."""
        if instructor.role not in ['teacher', 'admin']:
            raise ValidationError('Only teachers and admins can create courses.')
        
        # Set default status for teachers
        if instructor.role == 'teacher' and 'status' not in data:
            data['status'] = Course.Status.DRAFT
        
        course = Course.objects.create(
            instructor=instructor,
            **data
        )
        
        AuditLogger.log_course_action(
            actor=instructor,
            action_type=AuditLog.ActionType.COURSE_CREATED,
            course=course,
            description=f"Course '{course.title}' created",
            request=None
        )
        
        return course
    
    @staticmethod
    @transaction.atomic
    def submit_for_approval(course, instructor):
        """Submit course for admin approval."""
        if course.instructor != instructor:
            raise ValidationError('Only the course instructor can submit for approval.')
        
        if course.status != Course.Status.DRAFT:
            raise ValidationError('Only draft courses can be submitted for approval.')
        
        course.status = Course.Status.PENDING_APPROVAL
        course.save(update_fields=['status'])
        
        return course
    
    @staticmethod
    @transaction.atomic
    def approve_course(course, admin, reason=None):
        """Approve and publish a course."""
        if admin.role != 'admin':
            raise ValidationError('Only admins can approve courses.')
        
        if course.status != Course.Status.PENDING_APPROVAL:
            raise ValidationError('Only pending courses can be approved.')
        
        course.status = Course.Status.PUBLISHED
        course.save(update_fields=['status', 'published_at'])
        
        AuditLogger.log_course_action(
            actor=admin,
            action_type=AuditLog.ActionType.COURSE_APPROVED,
            course=course,
            description=f"Course '{course.title}' approved by {admin.email}",
            reason=reason,
            request=None
        )
        
        return course
    
    @staticmethod
    @transaction.atomic
    def reject_course(course, admin, reason):
        """Reject a course."""
        if admin.role != 'admin':
            raise ValidationError('Only admins can reject courses.')
        
        if not reason:
            raise ValidationError('Rejection reason is required.')
        
        course.status = Course.Status.REJECTED
        course.rejection_reason = reason
        course.save(update_fields=['status', 'rejection_reason'])
        
        AuditLogger.log_course_action(
            actor=admin,
            action_type=AuditLog.ActionType.COURSE_REJECTED,
            course=course,
            description=f"Course '{course.title}' rejected by {admin.email}",
            reason=reason,
            request=None
        )
        
        return course
    
    @staticmethod
    @transaction.atomic
    def delete_course(course, admin, refund_students=False, reason=None):
        """Delete a course (soft delete)."""
        if admin.role != 'admin':
            raise ValidationError('Only admins can delete courses.')
        
        course.soft_delete()
        
        # Handle refunds if requested
        if refund_students:
            from payments.services import PaymentService
            enrollments = Enrollment.objects.filter(course=course)
            for enrollment in enrollments:
                PaymentService.refund_purchase(
                    enrollment.student,
                    course,
                    reason=f"Course deletion: {reason or 'No reason provided'}"
                )
        
        AuditLogger.log_course_action(
            actor=admin,
            action_type=AuditLog.ActionType.COURSE_DELETED,
            course=course,
            description=f"Course '{course.title}' deleted by {admin.email}",
            reason=reason or f"Refund students: {refund_students}",
            request=None
        )
        
        return course
    
    @staticmethod
    @transaction.atomic
    def transfer_ownership(course, new_instructor, admin):
        """Transfer course ownership."""
        if admin.role != 'admin':
            raise ValidationError('Only admins can transfer ownership.')
        
        old_instructor = course.instructor
        course.transfer_ownership(new_instructor)
        
        AuditLogger.log_course_action(
            actor=admin,
            action_type=AuditLog.ActionType.OWNERSHIP_TRANSFERRED,
            course=course,
            description=f"Course '{course.title}' ownership transferred from {old_instructor.email if old_instructor else 'None'} to {new_instructor.email}",
            reason=None,
            request=None
        )
        
        return course


class EnrollmentService:
    """Service for enrollment operations."""
    
    @staticmethod
    @transaction.atomic
    def enroll_student(student, course):
        """Enroll a student in a course."""
        if student.role != 'student':
            raise ValidationError('Only students can enroll in courses.')
        
        if course.status != Course.Status.PUBLISHED:
            raise ValidationError('Cannot enroll in unpublished course.')
        
        if course.deleted_at:
            raise ValidationError('Cannot enroll in deleted course.')
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=student, course=course).exists():
            raise ValidationError('Student is already enrolled in this course.')
        
        enrollment = Enrollment.objects.create(
            student=student,
            course=course
        )
        
        return enrollment
    
    @staticmethod
    def can_access_lecture(student, lecture):
        """Check if student can access a lecture."""
        # Free lectures are always accessible
        if lecture.is_free:
            return True
        
        # Check if student is enrolled and has purchased the course
        from payments.models import Purchase
        if not Enrollment.objects.filter(student=student, course=lecture.section.course).exists():
            return False
        
        # Check if course was purchased
        purchase = Purchase.objects.filter(
            student=student,
            course=lecture.section.course,
            refunded=False
        ).exists()
        
        return purchase or lecture.section.course.price == 0

    @staticmethod
    @transaction.atomic
    def unenroll_student(student, course):
        """Unenroll a student from a course and clean up progress."""
        if student.role != 'student':
            raise ValidationError('Only students can be unenrolled.')

        try:
            enrollment = Enrollment.objects.get(student=student, course=course)
        except Enrollment.DoesNotExist:
            raise ValidationError('Student is not enrolled in this course.')

        # Remove lecture progress records
        try:
            from .models import LectureProgress
            LectureProgress.objects.filter(enrollment=enrollment).delete()
        except Exception:
            # If LectureProgress model is not available or deletion fails, continue
            pass

        # Delete enrollment
        enrollment.delete()

        # Update course stats if the service exists
        try:
            from payments.services import CourseStatsService
            CourseStatsService.update_course_stats(course)
        except Exception:
            pass

        # Audit log the unenrollment
        try:
            AuditLogger.log_course_action(
                actor=None,
                action_type='student_unenrolled',
                course=course,
                description=f"Student {student.email} unenrolled from course {course.title}",
                reason=None,
                request=None
            )
        except Exception:
            pass

        return True

