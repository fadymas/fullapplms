"""
URLs for courses app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, SectionViewSet, LectureViewSet, LectureFileViewSet,
    EnrollmentViewSet, LectureProgressViewSet, SecureFileDownloadView
)
from .views import QuizViewSet, QuestionViewSet, QuizAttemptViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'lectures', LectureViewSet, basename='lecture')
router.register(r'lecture-files', LectureFileViewSet, basename='lecture-file')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'lecture-progress', LectureProgressViewSet, basename='lecture-progress')

urlpatterns = [
    path('', include(router.urls)),
    # SECURITY FIX: Secure file download endpoint
    path('files/<int:file_id>/download/', SecureFileDownloadView.as_view(), name='secure-file-download'),
    
    # Lecture-based quiz nested endpoints
    path('lectures/<int:lecture_id>/quizzes/', QuizViewSet.as_view({'get':'list','post':'create'}), name='lecture-quizzes'),
    path('lectures/<int:lecture_id>/quizzes/<int:pk>/', QuizViewSet.as_view({'get':'retrieve','patch':'partial_update','delete':'destroy'}), name='lecture-quiz-detail'),
    path('lectures/<int:lecture_id>/quizzes/<int:pk>/publish/', QuizViewSet.as_view({'post':'publish'}), name='lecture-quiz-publish'),

    path('quizzes/<int:quiz_id>/questions/', QuestionViewSet.as_view({'get':'list','post':'create'}), name='quiz-questions'),
    path('quizzes/<int:quiz_id>/questions/<int:pk>/', QuestionViewSet.as_view({'get':'retrieve','patch':'partial_update','delete':'destroy'}), name='quiz-question-detail'),

    path('lectures/<int:lecture_id>/quizzes/<int:quiz_id>/attempts/', QuizAttemptViewSet.as_view({'get':'list','post':'create'}), name='quiz-attempts'),
    path('lectures/<int:lecture_id>/quizzes/<int:quiz_id>/attempts/<int:pk>/', QuizAttemptViewSet.as_view({'get':'retrieve','post':'submit'}), name='quiz-attempt-detail'),
]

