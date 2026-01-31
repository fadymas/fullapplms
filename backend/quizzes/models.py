"""
Models for the Quizzes application
Includes Quizzes, Questions, Attempts, and Grading
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
import json

from .validators import (
    validate_passing_grade,
    validate_positive_points,
    validate_max_attempts,
    validate_time_limit,
    validate_options_count,
    validate_correct_answer_exists
)

User = get_user_model()


class Quiz(models.Model):
    """
    Quiz model linked to a Lecture
    """
    class GradingMethod(models.TextChoices):
        HIGHEST = 'highest', 'Highest Score'
        LAST = 'last', 'Last Attempt'
    
    lecture = models.ForeignKey(
        'courses.Lecture',
        on_delete=models.CASCADE,
        related_name='quizzes_quizapp',
        related_query_name='quizzes_quizapp',
        null=True,
        blank=True,
        verbose_name=_('Lecture')
    )
    
    title = models.CharField(
        max_length=255,
        verbose_name=_('Quiz Title')
    )
    
    description = models.TextField(
        blank=True,
        verbose_name=_('Quiz Description')
    )
    
    is_mandatory = models.BooleanField(
        default=False,
        verbose_name=_('Mandatory'),
        help_text=_('Required to complete the course')
    )
    
    passing_grade = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('60.00'),
        validators=[validate_passing_grade],
        verbose_name=_('Passing Grade'),
        help_text=_('Minimum score to pass (0-100)')
    )
    
    max_attempts = models.PositiveIntegerField(
        default=1,
        validators=[validate_max_attempts],
        verbose_name=_('Maximum Attempts'),
        help_text=_('Maximum number of allowed attempts')
    )
    
    grading_method = models.CharField(
        max_length=10,
        choices=GradingMethod.choices,
        default=GradingMethod.HIGHEST,
        verbose_name=_('Grading Method')
    )
    
    time_limit_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[validate_time_limit],
        verbose_name=_('Time Limit (minutes)'),
        help_text=_('Quiz time limit in minutes (empty = no limit)')
    )
    
    is_published = models.BooleanField(
        default=False,
        verbose_name=_('Published'),
        help_text=_('Whether the quiz is published and available to students')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At')
    )
    
    class Meta:
        verbose_name = _('Quiz')
        verbose_name_plural = _('Quizzes')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['lecture', 'is_published']),
        ]
    
    def __str__(self):
        # Null-safe string representation
        if self.lecture and self.lecture.section and self.lecture.section.course:
            course = self.lecture.section.course
            course_title = course.title if hasattr(course, 'title') else 'Unknown Course'
            lecture_title = self.lecture.title if hasattr(self.lecture, 'title') else 'Unknown Lecture'
            return f"{course_title} - {lecture_title} - {self.title}"
        return self.title
    
    def clean(self):
        """
        Validate quiz data before saving
        """
        if self.passing_grade < Decimal('0') or self.passing_grade > Decimal('100'):
            raise ValidationError({'passing_grade': 'Passing grade must be between 0 and 100.'})
        
        if self.max_attempts < 1:
            raise ValidationError({'max_attempts': 'Number of attempts must be at least 1.'})
        
        if self.time_limit_minutes is not None and self.time_limit_minutes < 1:
            raise ValidationError({'time_limit_minutes': 'Time limit must be at least 1 minute.'})
    
    def publish(self):
        """
        Publish the quiz after validation
        """
        # Check if there are questions
        if self.questions.count() == 0:
            raise ValidationError('Cannot publish a quiz without questions.')
        
        # Validate each question
        for question in self.questions.all():
            question.clean()
            
            # For multiple choice questions, check if there's a correct answer
            if question.question_type in [Question.QuestionType.MULTIPLE_CHOICE, Question.QuestionType.TRUE_FALSE]:
                if not question.correct_answer:
                    raise ValidationError(f'Question {question.id} does not have a correct answer.')
        
        self.is_published = True
        self.save(update_fields=['is_published'])
    
    def unpublish(self):
        """
        Unpublish the quiz
        """
        self.is_published = False
        self.save(update_fields=['is_published'])
    
    def get_total_points(self):
        """
        Calculate total points from all questions
        """
        return self.questions.aggregate(total=models.Sum('points'))['total'] or Decimal('0')
    
    def can_student_take(self, student):
        """
        ?????? ??? ??? ?????? ????? ??? ??????
        """
        # ???? ?? ???? ???????? ????????
        if not self.lecture or not self.lecture.section or not self.lecture.section.course:
            return False, 'Quiz is not properly linked to a course'
        
        # ?????? ??? ?????? ??? ?????
        course = self.lecture.section.course
        
        # ?????? ?? ??????? ?? ??????
        from courses.models import Enrollment
        if not Enrollment.objects.filter(student=student, course=course).exists():
            return False, 'Student is not enrolled in this course'
        
        # ?????? ?? ??? ??????
        if not self.is_published:
            return False, 'Quiz is not published'
        
        # ?????? ?? ??? ?????????
        attempts_count = QuizAttempt.objects.filter(
            student=student,
            quiz=self
        ).count()
        
        if attempts_count >= self.max_attempts:
            return False, 'Maximum attempts reached'
        
        return True, None


class Question(models.Model):
    """
    Quiz question model
    """
    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice'
        TRUE_FALSE = 'true_false', 'True/False'
        ESSAY = 'essay', 'Essay'
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name=_('Quiz')
    )
    
    question_type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        verbose_name=_('Question Type')
    )
    
    text = models.TextField(
        verbose_name=_('Question Text')
    )
    
    order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        verbose_name=_('Order')
    )
    
    points = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('1.00'),
        validators=[validate_positive_points],
        verbose_name=_('Points')
    )
    
    # fields specific to certain question types
    options = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Options'),
        help_text=_('List of options for multiple choice questions (JSON)')
    )
    
    correct_answer = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_('Correct Answer'),
        help_text=_('Correct answer for multiple choice or true/false questions')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At')
    )
    
    class Meta:
        verbose_name = _('Question')
        verbose_name_plural = _('Questions')
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['quiz', 'order']),
        ]
    
    def __str__(self):
        return f"{self.quiz.title} - {self.text[:50]}"
    
    def clean(self):
        """
        Validate question data before saving
        """
        # Validate points
        if self.points <= Decimal('0'):
            raise ValidationError({'points': 'Question points must be greater than zero.'})
        
        # Validate based on question type
        if self.question_type == self.QuestionType.MULTIPLE_CHOICE:
            validate_options_count(self.options)
            validate_correct_answer_exists(
                self.question_type,
                self.correct_answer,
                self.options
            )
            
        elif self.question_type == self.QuestionType.TRUE_FALSE:
            # True/False question options are fixed
            self.options = ['True', 'False']
            
            if self.correct_answer not in ['True', 'False']:
                raise ValidationError({
                    'correct_answer': 'Correct answer for true/false must be "True" or "False".'
                })
                
        elif self.question_type == self.QuestionType.ESSAY:
            # Essay questions do not need options or a correct answer
            self.options = []
            self.correct_answer = None
    
    def is_answer_correct(self, student_answer):
        """
        Check if a student's answer is correct
        """
        if self.question_type in [self.QuestionType.MULTIPLE_CHOICE, self.QuestionType.TRUE_FALSE]:
            return student_answer == self.correct_answer
        return None  # for essay questions


class QuizAttempt(models.Model):
    """
    Student attempt to take a quiz
    Immutable after submission
    """
    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'In Progress'
        SUBMITTED = 'submitted', 'Submitted'
        GRADED = 'graded', 'Graded'
        TIMED_OUT = 'timed_out', 'Timed Out'
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='quizzes_quiz_attempts',
        verbose_name=_('Student'),
        limit_choices_to={'role': 'student'}
    )
    
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='attempts',
        verbose_name=_('Quiz')
    )
    
    attempt_number = models.PositiveIntegerField(
        verbose_name=_('Attempt Number')
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
        verbose_name=_('Status')
    )
    
    started_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Started At')
    )
    
    submitted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Submitted At')
    )
    
    time_taken_seconds = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Time Taken (seconds)')
    )
    
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Score'),
        help_text=_('Score out of 100')
    )
    
    passed = models.BooleanField(
        null=True,
        blank=True,
        verbose_name=_('Passed')
    )
    
    graded_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Graded At')
    )
    
    graded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_quizzes',
        verbose_name=_('Graded By'),
        limit_choices_to={'role__in': ['teacher', 'admin']}
    )
    
    class Meta:
        verbose_name = _('Quiz Attempt')
        verbose_name_plural = _('Quiz Attempts')
        unique_together = ['student', 'quiz', 'attempt_number']
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['student', 'quiz', '-started_at']),
            models.Index(fields=['status']),
            models.Index(fields=['quiz', 'student']),
        ]
    
    def __str__(self):
        return f"{self.student.email} - {self.quiz.title} - Attempt {self.attempt_number}"
    
    def clean(self):
        """
        Validate attempt data
        """
        if self.attempt_number < 1:
            raise ValidationError({'attempt_number': 'Attempt number must be at least 1.'})
    
    def submit(self):
        """
        Submit a quiz attempt
        """
        if self.status != self.Status.IN_PROGRESS:
            raise ValidationError('Quiz attempt is not in progress.')
        
        # Check time limit if quiz is timed
        if self.quiz.time_limit_minutes:
            time_elapsed = (timezone.now() - self.started_at).total_seconds() / 60
            if time_elapsed > self.quiz.time_limit_minutes:
                self.status = self.Status.TIMED_OUT
                self.submitted_at = timezone.now()
                self.time_taken_seconds = int((self.submitted_at - self.started_at).total_seconds())
                self.save(update_fields=['status', 'submitted_at', 'time_taken_seconds'])
                return
        
        # Normal submission
        self.status = self.Status.SUBMITTED
        self.submitted_at = timezone.now()
        self.time_taken_seconds = int((self.submitted_at - self.started_at).total_seconds())
        self.save(update_fields=['status', 'submitted_at', 'time_taken_seconds'])
        
        # Auto-grade if no essay questions
        if not self.quiz.questions.filter(question_type=Question.QuestionType.ESSAY).exists():
            self.auto_grade()
    
    def auto_grade(self):
        """
        Auto-grade multiple choice and true/false questions
        """
        total_points = Decimal('0.00')
        earned_points = Decimal('0.00')
        
        for answer in self.answers.all():
            if answer.question.question_type in [Question.QuestionType.MULTIPLE_CHOICE, Question.QuestionType.TRUE_FALSE]:
                total_points += answer.question.points
                if answer.is_correct:
                    earned_points += answer.question.points
        
        if total_points > 0:
            self.score = (earned_points / total_points) * Decimal('100.00')
            self.passed = self.score >= self.quiz.passing_grade
        else:
            self.score = Decimal('0.00')
            self.passed = False
        
        self.status = self.Status.GRADED
        self.graded_at = timezone.now()
        self.save(update_fields=['score', 'passed', 'status', 'graded_at'])
    
    def manual_grade(self, grader, scores):
        """
        Manual grading for essay questions
        """
        if not self.quiz.questions.filter(question_type=Question.QuestionType.ESSAY).exists():
            raise ValidationError('This quiz contains no essay questions requiring manual grading.')
        
        if grader.role not in ['teacher', 'admin']:
            raise ValidationError('Only teachers or admins can grade quizzes.')
        
        total_points = Decimal('0.00')
        earned_points = Decimal('0.00')
        
        # Grading essay questions
        for answer in self.answers.filter(question__question_type=Question.QuestionType.ESSAY):
            question_id = str(answer.question.id)
            if question_id in scores:
                points = Decimal(str(scores[question_id]))
                if points < Decimal('0') or points > answer.question.points:
                    raise ValidationError(f'Grade for question {question_id} is invalid.')
                
                answer.points_earned = points
                answer.save(update_fields=['points_earned'])
            
            total_points += answer.question.points
            earned_points += answer.points_earned or Decimal('0.00')
        
        # Grading choice questions if any
        for answer in self.answers.filter(question__question_type__in=[Question.QuestionType.MULTIPLE_CHOICE, Question.QuestionType.TRUE_FALSE]):
            total_points += answer.question.points
            if answer.is_correct:
                earned_points += answer.question.points
        
        if total_points > 0:
            self.score = (earned_points / total_points) * Decimal('100.00')
            self.passed = self.score >= self.quiz.passing_grade
        else:
            self.score = Decimal('0.00')
            self.passed = False
        
        self.status = self.Status.GRADED
        self.graded_by = grader
        self.graded_at = timezone.now()
        self.save(update_fields=['score', 'passed', 'status', 'graded_by', 'graded_at'])
    
    def get_time_remaining(self):
        """
        Calculate remaining time for the quiz
        """
        if self.quiz.time_limit_minutes and self.status == self.Status.IN_PROGRESS:
            elapsed_seconds = (timezone.now() - self.started_at).total_seconds()
            total_seconds = self.quiz.time_limit_minutes * 60
            remaining = total_seconds - elapsed_seconds
            return max(0, int(remaining))
        return None


class Answer(models.Model):
    """
    Student answer to a quiz question; immutable after submission
    """
    attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name=_('Attempt')
    )
    
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name=_('Question')
    )
    
    answer_text = models.TextField(
        blank=True,
        null=True,      # ? ????? ??? ????? ?????? ?????? ??????? ?? ????? ????????
        default='',     # ? ?????? ?????????? ??? ???????
        verbose_name=_('Answer Text')
    )
    
    selected_option = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_('Selected Option')
    )
    
    is_correct = models.BooleanField(
        null=True,
        blank=True,
        verbose_name=_('Is Correct')
    )
    
    points_earned = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Points Earned')
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At')
    )
    
    class Meta:
        verbose_name = _('Answer')
        verbose_name_plural = _('Answers')
        unique_together = ['attempt', 'question']
        ordering = ['question__order']
    
    def __str__(self):
        return f"{self.attempt} - {self.question.text[:50]}"
    
    def save(self, *args, **kwargs):
        """
        Auto-validate correctness for choice questions
        """
        # ???? ?? answer_text ???? null ?????
        if self.answer_text is None:
            self.answer_text = ""
        
        # For MCQ and True/False, determine correctness automatically
        if self.question.question_type in [Question.QuestionType.MULTIPLE_CHOICE, Question.QuestionType.TRUE_FALSE]:
            if self.selected_option:
                self.is_correct = (self.selected_option == self.question.correct_answer)
                if self.is_correct:
                    self.points_earned = self.question.points
                else:
                    self.points_earned = Decimal('0.00')
            else:
                self.is_correct = False
                self.points_earned = Decimal('0.00')
        
        super().save(*args, **kwargs)
    
    def get_display_answer(self):
        """
        Get a human-readable answer representation
        """
        if self.question.question_type == Question.QuestionType.ESSAY:
            return self.answer_text or ""
        elif self.selected_option:
            return self.selected_option
        return "No answer provided"