"""
Admin configuration for courses app.
"""
from django.contrib import admin
from .models import Course, Section, Lecture, LectureFile, Enrollment, LectureProgress


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'status', 'price', 'student_count', 'created_at']
    list_filter = ['status', 'difficulty_level', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['published_at', 'created_at', 'updated_at', 'price_locked']
    
    def student_count(self, obj):
        return obj.enrollments.count()
    student_count.short_description = 'Students'


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    search_fields = ['title']


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ['title', 'section', 'order', 'is_free', 'duration_minutes']
    list_filter = ['is_free', 'section__course']
    search_fields = ['title']


@admin.register(LectureFile)
class LectureFileAdmin(admin.ModelAdmin):
    list_display = ['title', 'lecture', 'is_free']
    list_filter = ['is_free']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrolled_at', 'progress_percentage', 'completed_at']
    list_filter = ['enrolled_at', 'completed_at']
    search_fields = ['student__email', 'course__title']


@admin.register(LectureProgress)
class LectureProgressAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'lecture', 'completed', 'watch_time_seconds']
    list_filter = ['completed']

