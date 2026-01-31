"""
Courses app models.
Implements course lifecycle, soft deletes, and ownership management.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Q, Sum, Count
from decimal import Decimal

User = get_user_model()


class CourseManager(models.Manager):
    """Custom manager for Course model."""
    
    def published(self):
        """Return only published courses."""
        return self.filter(status=Course.Status.PUBLISHED, deleted_at__isnull=True)
    
    def active(self):
        """Return active (non-deleted) courses."""
        return self.filter(deleted_at__isnull=True)
    
    def for_instructor(self, instructor):
        """Return courses for a specific instructor."""
        return self.filter(instructor=instructor, deleted_at__isnull=True)


class Course(models.Model):
    """
    Course model with lifecycle management.
    Draft ? Admin approval ? Published
    """
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING_APPROVAL = 'pending_approval', 'Pending Approval'
        PUBLISHED = 'published', 'Published'
        REJECTED = 'rejected', 'Rejected'
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='courses',
        limit_choices_to=Q(role='teacher') | Q(role='admin')
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True
    )
    
    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Price in base currency. Immutable after first purchase.'
    )
    price_locked = models.BooleanField(
        default=False,
        help_text='True if price cannot be changed (first purchase made)'
    )
    
    # Metadata
    thumbnail = models.ImageField(upload_to='courses/thumbnails/', blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='beginner'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # Rejection reason (if rejected)
    rejection_reason = models.TextField(blank=True, null=True)
    
    objects = CourseManager()
    
    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'deleted_at']),
            models.Index(fields=['instructor', 'deleted_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def clean(self):
        """Validate course data."""
        if self.status == self.Status.REJECTED and not self.rejection_reason:
            raise ValidationError('Rejection reason is required when rejecting a course.')
        
        # Price cannot be changed if locked
        if self.pk and self.price_locked:
            original = Course.objects.get(pk=self.pk)
            if original.price != self.price:
                raise ValidationError('Price cannot be changed after first purchase.')
    
    def save(self, *args, **kwargs):
        """Override save to handle status changes."""
        if self.status == self.Status.PUBLISHED and not self.published_at:
            self.published_at = timezone.now()
        self.full_clean()
        super().save(*args, **kwargs)
    
    def soft_delete(self):
        """Soft delete the course."""
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])
    
    def restore(self):
        """Restore a soft-deleted course."""
        self.deleted_at = None
        self.save(update_fields=['deleted_at'])
    
    def transfer_ownership(self, new_instructor):
        """Transfer course ownership to a new instructor or admin."""
        if new_instructor.role not in ['teacher', 'admin']:
            raise ValidationError('New owner must be a teacher or admin.')
        self.instructor = new_instructor
        self.save(update_fields=['instructor'])
    
    def has_purchases(self):
        """Check if course has any purchases."""
        from payments.models import Purchase
        return Purchase.objects.filter(course=self, refunded=False).exists()
    
    def lock_price(self):
        """Lock the price (called after first purchase)."""
        self.price_locked = True
        self.save(update_fields=['price_locked'])
    
    # ?????? ????? methods ????? ??? ????? ??? ?????? ??? ?????? ??????
    
    def is_purchased_by(self, user):
        """???? ??? ??? ???????? ????? ??? ??????"""
        from payments.models import Purchase
        return Purchase.objects.filter(
            student=user,
            course=self,
            refunded=False
        ).exists() or self.price == 0
    
    def can_access_content(self, user):
        """???? ??? ??? ???????? ????? ?????? ??????? ??????"""
        if user.role in ['admin', 'teacher']:
            return True
        if user.role == 'student':
            return self.is_purchased_by(user)
        return False
    
    def get_basic_info(self):
        """????? ????????? ???????? ?????? (???? ?????)"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'instructor': self.instructor.get_full_name() if self.instructor else None,
            'price': str(self.price),
            'thumbnail': self.thumbnail.url if self.thumbnail else None,
            'category': self.category,
            'difficulty_level': self.difficulty_level,
            'student_count': self.enrollments.count(),
        }


class Section(models.Model):
    """Course section containing lectures."""
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='sections'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Section'
        verbose_name_plural = 'Sections'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['course', 'order']),
        ]
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"
    
    def soft_delete(self):
        """Soft delete the section."""
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])


class Lecture(models.Model):
    """Lecture within a section."""
    class LectureType(models.TextChoices):
        VIDEO = 'video', 'Video'
        ARTICLE = 'article', 'Article'
        QUIZ = 'quiz', 'Quiz'
        ASSIGNMENT = 'assignment', 'Assignment'
    
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name='lectures'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content = models.TextField(blank=True)
    video_url = models.URLField(blank=True, null=True)
    lecture_type = models.CharField(
        max_length=20,
        choices=LectureType.choices,
        default=LectureType.VIDEO,
        db_index=True
    )
    prerequisite = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dependent_lectures',
        help_text='Lecture that must be completed before this one'
    )
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_free = models.BooleanField(
        default=False,
        help_text='If True, lecture is accessible without purchase'
    )
    duration_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Lecture'
        verbose_name_plural = 'Lectures'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['section', 'order']),
        ]
    
    def __str__(self):
        return f"{self.section.course.title} - {self.title}"
    
    def soft_delete(self):
        """Soft delete the lecture."""
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])
        
        # Recalculate progress for all students enrolled in this course
        from courses.signals import recalculate_course_progress
        recalculate_course_progress(self.section.course)


class LectureFile(models.Model):
    """Files attached to lectures."""
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='files'
    )
    # SECURITY FIX: Store in private directory to prevent unauthorized access
    file = models.FileField(upload_to='private_media/courses/lectures/files/')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_free = models.BooleanField(
        default=False,
        help_text='If True, file is accessible without purchase'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Lecture File'
        verbose_name_plural = 'Lecture Files'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.lecture.title} - {self.title}"
    
    def soft_delete(self):
        """Soft delete the file."""
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])


class Enrollment(models.Model):
    """Student enrollment in a course."""
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'student'}
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    class Meta:
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
        unique_together = ['student', 'course']
        indexes = [
            models.Index(fields=['student', 'enrolled_at']),
            models.Index(fields=['course', 'enrolled_at']),
        ]
    
    def __str__(self):
        return f"{self.student.email} - {self.course.title}"
    
    def calculate_progress(self):
        """Calculate and update progress percentage."""
        course = self.course
        total_lectures = Lecture.objects.filter(
            section__course=course,
            deleted_at__isnull=True
        ).count()
        
        if total_lectures == 0:
            self.progress_percentage = Decimal('100.00')
        else:
            completed_lectures = LectureProgress.objects.filter(
                enrollment=self,
                completed=True
            ).count()
            self.progress_percentage = Decimal(
                (completed_lectures / total_lectures) * 100
            ).quantize(Decimal('0.01'))
        
        self.save(update_fields=['progress_percentage'])
        
        # Mark as completed if progress is 100%
        if self.progress_percentage >= Decimal('100.00') and not self.completed_at:
            self.completed_at = timezone.now()
            self.save(update_fields=['completed_at'])


class LectureProgress(models.Model):
    """Track student progress through lectures."""
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='lecture_progress'
    )
    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='progress_records'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    watch_time_seconds = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = 'Lecture Progress'
        verbose_name_plural = 'Lecture Progress'
        unique_together = ['enrollment', 'lecture']
        indexes = [
            models.Index(fields=['enrollment', 'completed']),
        ]
    
    def __str__(self):
        return f"{self.enrollment.student.email} - {self.lecture.title}"
    
    def mark_completed(self):
        """Mark lecture as completed."""
        if not self.completed:
            self.completed = True
            self.completed_at = timezone.now()
            self.save(update_fields=['completed', 'completed_at'])
            # Recalculate course progress
            self.enrollment.calculate_progress()


class Quiz(models.Model):
    """Quiz attached to a Lecture."""
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'

    lecture = models.ForeignKey(
        Lecture,
        on_delete=models.CASCADE,
        related_name='quizzes'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    time_limit_seconds = models.PositiveIntegerField(null=True, blank=True)
    max_attempts = models.PositiveIntegerField(null=True, blank=True)
    randomize_questions = models.BooleanField(default=False)
    is_mandatory = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_quizzes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.lecture} - {self.title}"


class Question(models.Model):
    class Type(models.TextChoices):
        MCQ = 'mcq', 'Multiple Choice'
        TRUE_FALSE = 'tf', 'True/False'
        ESSAY = 'essay', 'Essay'

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    order = models.PositiveIntegerField(default=0, db_index=True)
    type = models.CharField(max_length=10, choices=Type.choices)
    text = models.TextField()
    points = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        ordering = ['order']

    def __str__(self):
        return f"Q{self.id} ({self.type}) - {self.quiz.title}"


class QuestionOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=1024)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Question Option'
        verbose_name_plural = 'Question Options'
        ordering = ['order']

    def __str__(self):
        return f"Option {self.id} for Q{self.question.id}"


class QuizAttempt(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'In Progress'
        SUBMITTED = 'submitted', 'Submitted'
        GRADED = 'graded', 'Graded'

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PROGRESS, db_index=True)
    score = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    attempt_number = models.PositiveIntegerField(default=1)
    meta = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = 'Quiz Attempt'
        verbose_name_plural = 'Quiz Attempts'
        ordering = ['-started_at']

    def __str__(self):
        return f"Attempt {self.id} by {self.student} on {self.quiz}"


class AttemptAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    # store student response; for MCQ: list of option ids, for essay: text
    answer_payload = models.JSONField()
    is_correct = models.BooleanField(null=True)
    award_points = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_answers')
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Attempt Answer'
        verbose_name_plural = 'Attempt Answers'

    def __str__(self):
        return f"Answer {self.id} for Attempt {self.attempt.id}"