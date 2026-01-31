"""
Admin Dashboard for Quizzes Application
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Quiz, Question, QuizAttempt, Answer


class QuestionInline(admin.TabularInline):
    """
    Inline questions in quiz admin
    """
    model = Question
    extra = 1
    # include options and correct_answer so model validation can report field errors on the inline form
    fields = ['question_type', 'text', 'points', 'order', 'options', 'correct_answer']
    ordering = ['order']


class AnswerInline(admin.TabularInline):
    """
    Inline answers in attempt admin
    """
    model = Answer
    extra = 0
    fields = ['question', 'selected_option', 'answer_text', 'is_correct', 'points_earned']
    readonly_fields = ['is_correct', 'points_earned']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    """
    Quiz Admin
    """
    list_display = ['title', 'lecture', 'course', 'is_published', 'is_mandatory', 'question_count', 'created_at']
    list_filter = ['is_published', 'is_mandatory', 'lecture', 'created_at']
    search_fields = ['title', 'description', 'lecture__title', 'lecture__course__title']
    readonly_fields = ['created_at', 'updated_at', 'total_points_display']
    fieldsets = [
        ('Basic Information', {
            'fields': ['lecture', 'title', 'description']
        }),
        ('Quiz Settings', {
            'fields': [
                'is_mandatory',
                'passing_grade',
                'max_attempts',
                'grading_method',
                'time_limit_minutes',
                'is_published'
            ]
        }),
        ('Additional Information', {
            'fields': ['created_at', 'updated_at', 'total_points_display'],
            'classes': ['collapse']
        }),
    ]
    inlines = [QuestionInline]
    
    def course(self, obj):
        """
        Display course name (null-safe)
        """
        lecture = getattr(obj, 'lecture', None)
        course = getattr(lecture, 'course', None) if lecture else None
        return course.title if course and getattr(course, 'title', None) else '—'
    course.short_description = 'Course'
    
    def total_points_display(self, obj):
        """
        Display total quiz points
        """
        return obj.get_total_points()
    total_points_display.short_description = 'Total Points'
    
    def question_count(self, obj):
        """
        Display question count
        """
        return obj.questions.count()
    question_count.short_description = 'Question Count'
    
    def save_model(self, request, obj, form, change):
        """
        Save quiz with validation
        """
        if change and obj.is_published:
            # Validate quiz before saving if published
            try:
                obj.clean()
                for question in obj.questions.all():
                    question.clean()
            except Exception as e:
                from django.contrib import messages
                messages.error(request, f'Validation error: {str(e)}')
                return
        
        super().save_model(request, obj, form, change)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """
    إدارة الأسئلة
    """
    list_display = ['text_truncated', 'quiz', 'question_type', 'points', 'order']
    list_filter = ['question_type', 'quiz', 'created_at']
    search_fields = ['text', 'quiz__title']
    readonly_fields = ['created_at']
    fieldsets = [
        ('معلومات أساسية', {
            'fields': ['quiz', 'question_type', 'text', 'points', 'order']
        }),
        ('خيارات الإجابة', {
            'fields': ['options', 'correct_answer'],
            'description': 'للأسئلة الاختيارية وصح/خطأ فقط'
        }),
        ('معلومات إضافية', {
            'fields': ['created_at'],
            'classes': ['collapse']
        }),
    ]
    
    def text_truncated(self, obj):
        """
        عرض نص مختصر للسؤال
        """
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_truncated.short_description = 'نص السؤال'


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    """
    إدارة محاولات الكويز
    """
    list_display = ['student', 'quiz', 'attempt_number', 'status', 'score', 'passed', 'started_at']
    list_filter = ['status', 'passed', 'quiz', 'started_at']
    search_fields = ['student__email', 'student__first_name', 'student__last_name', 'quiz__title']
    readonly_fields = ['started_at', 'submitted_at', 'time_taken_seconds', 'graded_at']
    fieldsets = [
        ('معلومات المحاولة', {
            'fields': ['student', 'quiz', 'attempt_number', 'status']
        }),
        ('النتائج', {
            'fields': ['score', 'passed', 'graded_by']
        }),
        ('التوقيت', {
            'fields': ['started_at', 'submitted_at', 'time_taken_seconds', 'graded_at'],
            'classes': ['collapse']
        }),
    ]
    inlines = [AnswerInline]
    
    def has_add_permission(self, request):
        """
        منع إضافة محاولات يدوياً
        """
        return False
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        """
        عرض تفاصيل المحاولة
        """
        extra_context = extra_context or {}
        extra_context['show_save'] = False
        extra_context['show_save_and_continue'] = False
        extra_context['show_save_and_add_another'] = False
        return super().change_view(request, object_id, form_url, extra_context)


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    """
    إدارة الإجابات
    """
    list_display = ['attempt', 'question_truncated', 'is_correct', 'points_earned']
    list_filter = ['is_correct', 'created_at']
    search_fields = ['attempt__student__email', 'question__text']
    readonly_fields = ['created_at', 'is_correct', 'points_earned']
    fieldsets = [
        ('معلومات الإجابة', {
            'fields': ['attempt', 'question']
        }),
        ('تفاصيل الإجابة', {
            'fields': ['answer_text', 'selected_option']
        }),
        ('النتائج', {
            'fields': ['is_correct', 'points_earned']
        }),
        ('معلومات إضافية', {
            'fields': ['created_at'],
            'classes': ['collapse']
        }),
    ]
    
    def question_truncated(self, obj):
        """
        عرض نص مختصر للسؤال
        """
        return obj.question.text[:30] + '...' if len(obj.question.text) > 30 else obj.question.text
    question_truncated.short_description = 'السؤال'
    
    def has_add_permission(self, request):
        """
        منع إضافة إجابات يدوياً
        """
        return False