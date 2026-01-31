"""
Services for Quizzes Application
Main business logic for the application
"""

from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models import F, Q
from decimal import Decimal
import logging

from .models import Quiz, QuizAttempt, Question, Answer
from users.audit import AuditLogger
from users.models import AuditLog
from courses.models import Enrollment

logger = logging.getLogger(__name__)


class QuizService:
    """
    Quiz operations service
    """
    
    @staticmethod
    @transaction.atomic
    def start_attempt(student, quiz):
        """
        Start a new quiz attempt
        """
        # Check if student can take the quiz
        can_take, reason = quiz.can_student_take(student)
        if not can_take:
            raise ValidationError(f"Cannot start attempt: {reason}")
        
        # Check if student is enrolled in the course
        # ???? ?? ???? ???????? ????????
        if not quiz.lecture or not quiz.lecture.section or not quiz.lecture.section.course:
            raise ValidationError("Quiz is not properly linked to a course")
        
        course = quiz.lecture.section.course
        if not Enrollment.objects.filter(student=student, course=course).exists():
            raise ValidationError("Student is not enrolled in this course")
        
        # Check if quiz is published
        if not quiz.is_published:
            raise ValidationError("Quiz is not published")
        
        # Calculate attempt number
        previous_attempts = QuizAttempt.objects.filter(
            student=student,
            quiz=quiz
        ).count()
        
        attempt_number = previous_attempts + 1
        
        # Create attempt
        attempt = QuizAttempt.objects.create(
            student=student,
            quiz=quiz,
            attempt_number=attempt_number,
            status=QuizAttempt.Status.IN_PROGRESS
        )
        
        # Create empty answers for all questions
        # ? ?????: answer_text="" if question.question_type == Question.QuestionType.ESSAY else None
        # ? ???????: answer_text="" for ALL question types
        questions = quiz.questions.all()
        for question in questions:
            Answer.objects.create(
                attempt=attempt,
                question=question,
                answer_text="",  # ????? ????? ??????
                selected_option=None
            )
        
        # Audit log
        try:
            AuditLogger.log_quiz_action(
                actor=student,
                action_type=AuditLog.ActionType.QUIZ_STARTED,
                quiz_attempt=attempt,
                description=f"Started quiz attempt: {quiz.title}",
                request=None
            )
        except Exception as e:
            logger.error(f"Failed to log attempt start: {str(e)}")
        
        logger.info(f"Student {student.email} started quiz attempt for {quiz.title}")
        
        return attempt
    
    @staticmethod
    @transaction.atomic
    def submit_attempt(attempt):
        """
        Submit a quiz attempt
        """
        # Lock the attempt record to prevent concurrent submissions
        attempt = QuizAttempt.objects.select_for_update().get(pk=attempt.pk)
        
        # Ensure attempt is in progress
        if attempt.status != QuizAttempt.Status.IN_PROGRESS:
            raise ValidationError('Quiz attempt is not in progress.')
        
        # Check time limit and handle timeout
        if attempt.quiz.time_limit_minutes:
            elapsed_minutes = (timezone.now() - attempt.started_at).total_seconds() / 60
            
            if elapsed_minutes > attempt.quiz.time_limit_minutes:
                attempt.status = QuizAttempt.Status.TIMED_OUT
                attempt.submitted_at = timezone.now()
                attempt.time_taken_seconds = int((attempt.submitted_at - attempt.started_at).total_seconds())
                attempt.save(update_fields=['status', 'submitted_at', 'time_taken_seconds'])
                
                # Auto-grade if no essay questions
                try:
                    if not attempt.quiz.questions.filter(question_type=Question.QuestionType.ESSAY).exists():
                        attempt.auto_grade()
                except Exception as e:
                    logger.error(f"Auto-grading failed for attempt {attempt.id}: {str(e)}")
                
                return attempt
        
        # Normal submit
        attempt.submit()
        
        # Audit log
        try:
            AuditLogger.log_quiz_action(
                actor=attempt.student,
                action_type=AuditLog.ActionType.QUIZ_SUBMITTED,
                quiz_attempt=attempt,
                description=f"Submitted quiz attempt: {attempt.quiz.title}",
                request=None
            )
        except Exception as e:
            logger.error(f"Failed to log attempt submission: {str(e)}")
        
        logger.info(f"Student {attempt.student.email} submitted quiz attempt {attempt.quiz.title}")
        
        return attempt
    
    @staticmethod
    @transaction.atomic
    def submit_answer(attempt, question_id, answer_data):
        """
        Submit an answer for a question
        """
        # Ensure attempt is in progress
        if attempt.status != QuizAttempt.Status.IN_PROGRESS:
            raise ValidationError('Quiz attempt is not in progress.')
        
        # Fetch question
        try:
            question = Question.objects.get(id=question_id, quiz=attempt.quiz)
        except Question.DoesNotExist:
            raise ValidationError('Question not found or does not belong to this quiz.')
        
        # Get or create answer record with defaults
        answer, created = Answer.objects.get_or_create(
            attempt=attempt,
            question=question,
            defaults={
                'answer_text': '',  # ???? ????????
                'selected_option': None
            }
        )
        
        # Update answer based on question type
        if question.question_type == Question.QuestionType.ESSAY:
            answer_text = answer_data.get('answer_text', '')
            if not answer_text:
                raise ValidationError('Answer text is required for essay questions.')
            answer.answer_text = answer_text
            
        elif question.question_type in [Question.QuestionType.MULTIPLE_CHOICE, Question.QuestionType.TRUE_FALSE]:
            selected_option = answer_data.get('selected_option')
            if not selected_option:
                raise ValidationError('Selected option is required.')
            
            if selected_option not in question.options:
                raise ValidationError('Selected option is invalid.')
            
            answer.selected_option = selected_option
        
        answer.save()
        
        logger.debug(f"Submitted answer for question {question_id} in attempt {attempt.id}")
        
        return answer
    
    @staticmethod
    @transaction.atomic
    def grade_attempt(attempt, grader, scores):
        """
        Manual grading for a quiz attempt (essay questions)
        """
        # Check grader permission
        if grader.role not in ['teacher', 'admin']:
            raise ValidationError('Only teachers or admins can grade quizzes.')
        
        # Ensure attempt was submitted
        if attempt.status not in [QuizAttempt.Status.SUBMITTED, QuizAttempt.Status.TIMED_OUT]:
            raise ValidationError('Attempt must be submitted before grading.')
        
        # Ensure quiz has essay questions
        if not attempt.quiz.questions.filter(question_type=Question.QuestionType.ESSAY).exists():
            raise ValidationError('This quiz contains no essay questions requiring manual grading.')
        
        # Perform grading
        attempt.manual_grade(grader, scores)
        
        # Audit log
        try:
            AuditLogger.log_quiz_action(
                actor=grader,
                action_type=AuditLog.ActionType.QUIZ_GRADED,
                quiz_attempt=attempt,
                description=f"Graded quiz: {attempt.quiz.title} - Score: {attempt.score}",
                request=None
            )
        except Exception as e:
            logger.error(f"Failed to log grading: {str(e)}")
        
        logger.info(f"Attempt {attempt.id} graded by {grader.email} - Score: {attempt.score}")
        
        return attempt
    
    @staticmethod
    @transaction.atomic
    def publish_quiz(quiz, actor):
        """
        Publish quiz
        """
        # Check publisher permission
        if actor.role not in ['teacher', 'admin']:
            raise ValidationError('Only teachers or admins can publish quizzes.')
        
        # If teacher, ensure they teach the course of the lecture
        if actor.role == 'teacher':
            if not quiz.lecture or not quiz.lecture.section or not quiz.lecture.section.course:
                raise ValidationError('Quiz is not properly linked to a course')
            
            if quiz.lecture.section.course.instructor != actor:
                raise ValidationError('You cannot publish a quiz for a course you do not teach.')
        
        # Publish
        quiz.publish()
        
        # Audit log
        try:
            AuditLogger.log_quiz_action(
                actor=actor,
                action_type=AuditLog.ActionType.QUIZ_PUBLISHED,
                quiz_attempt=None,
                description=f"Published quiz: {quiz.title}",
                request=None
            )
        except Exception as e:
            logger.error(f"Failed to log quiz publish: {str(e)}")
        
        logger.info(f"Published quiz {quiz.id} by {actor.email}")
        
        return quiz
    
    @staticmethod
    @transaction.atomic
    def unpublish_quiz(quiz, actor):
        """
        Unpublish quiz
        """
        # Check permission
        if actor.role not in ['teacher', 'admin']:
            raise ValidationError('Only teachers or admins can unpublish quizzes.')
        
        # If teacher, ensure they teach the course of the lecture
        if actor.role == 'teacher':
            if not quiz.lecture or not quiz.lecture.section or not quiz.lecture.section.course:
                raise ValidationError('Quiz is not properly linked to a course')
            
            if quiz.lecture.section.course.instructor != actor:
                raise ValidationError('You cannot unpublish a quiz for a course you do not teach.')
        
        # Unpublish
        quiz.unpublish()
        
        # Audit log
        try:
            AuditLogger.log_quiz_action(
                actor=actor,
                action_type=AuditLog.ActionType.QUIZ_UNPUBLISHED,
                quiz_attempt=None,
                description=f"Unpublished quiz: {quiz.title}",
                request=None
            )
        except Exception as e:
            logger.error(f"Failed to log quiz unpublish: {str(e)}")
        
        logger.info(f"Unpublished quiz {quiz.id} by {actor.email}")
        
        return quiz
    
    @staticmethod
    def get_student_quiz_info(student, quiz):
        """
        Get quiz information for a student
        """
        info = {
            'quiz': quiz,
            'can_take': False,
            'reason': '',
            'remaining_attempts': 0,
            'previous_attempts': [],
            'best_score': None
        }
        
        # Check eligibility
        can_take, reason = quiz.can_student_take(student)
        info['can_take'] = can_take
        info['reason'] = reason
        
        # Remaining attempts
        attempts_count = QuizAttempt.objects.filter(
            student=student,
            quiz=quiz
        ).count()
        info['remaining_attempts'] = max(0, quiz.max_attempts - attempts_count)
        
        # Previous attempts
        previous_attempts = QuizAttempt.objects.filter(
            student=student,
            quiz=quiz
        ).order_by('-started_at')
        info['previous_attempts'] = previous_attempts
        
        # Best score according to grading method
        if quiz.grading_method == Quiz.GradingMethod.HIGHEST:
            best_attempt = previous_attempts.filter(status=QuizAttempt.Status.GRADED).order_by('-score').first()
        else:  # LAST
            best_attempt = previous_attempts.filter(status=QuizAttempt.Status.GRADED).order_by('-submitted_at').first()
        
        info['best_score'] = best_attempt.score if best_attempt else None
        
        return info
    
    @staticmethod
    def get_lecture_quizzes_stats(lecture, teacher=None):
        """
        Get quiz statistics for a lecture
        """
        quizzes = Quiz.objects.filter(lecture=lecture)
        
        if teacher and teacher.role == 'teacher':
            quizzes = quizzes.filter(lecture__section__course__instructor=teacher)
        
        stats = {
            'total_quizzes': quizzes.count(),
            'published_quizzes': quizzes.filter(is_published=True).count(),
            'mandatory_quizzes': quizzes.filter(is_mandatory=True).count(),
            'total_questions': 0,
            'average_attempts': 0
        }
        
        # Calculate total questions
        for quiz in quizzes:
            stats['total_questions'] += quiz.questions.count()
        
        # Calculate average attempts
        total_attempts = QuizAttempt.objects.filter(quiz__lecture=lecture).count()
        if quizzes.count() > 0:
            stats['average_attempts'] = total_attempts / quizzes.count()
        
        return stats
    
    @staticmethod
    def get_course_quizzes_stats(course, teacher=None):
        """
        Get quiz statistics for a course (aggregated from all lectures)
        """
        from courses.models import Lecture
        lectures = Lecture.objects.filter(section__course=course)
        
        if teacher and teacher.role == 'teacher':
            lectures = lectures.filter(section__course__instructor=teacher)
        
        total_quizzes = 0
        published_quizzes = 0
        mandatory_quizzes = 0
        total_questions = 0
        total_attempts = 0
        
        for lecture in lectures:
            quizzes = Quiz.objects.filter(lecture=lecture)
            total_quizzes += quizzes.count()
            published_quizzes += quizzes.filter(is_published=True).count()
            mandatory_quizzes += quizzes.filter(is_mandatory=True).count()
            
            for quiz in quizzes:
                total_questions += quiz.questions.count()
            
            total_attempts += QuizAttempt.objects.filter(quiz__lecture=lecture).count()
        
        stats = {
            'total_quizzes': total_quizzes,
            'published_quizzes': published_quizzes,
            'mandatory_quizzes': mandatory_quizzes,
            'total_questions': total_questions,
            'average_attempts': total_attempts / total_quizzes if total_quizzes > 0 else 0
        }
        
        return stats