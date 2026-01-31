# urls.py
"""
Quizzes Application URLs
Define API routes
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuizAttemptViewSet, QuestionViewSet

# Create main router
router = DefaultRouter()

# Register ViewSets with proper base names
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'attempts', QuizAttemptViewSet, basename='quiz-attempt')
router.register(r'questions', QuestionViewSet, basename='question')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]

# ?? API Routes Summary:

"""
# Quiz Routes (/quizzes/)
GET     /quizzes/                          # List quizzes
POST    /quizzes/                          # Create new quiz
GET     /quizzes/{id}/                     # Quiz details
PUT     /quizzes/{id}/                     # Full quiz update
PATCH   /quizzes/{id}/                     # Partial quiz update
DELETE  /quizzes/{id}/                     # Delete quiz
POST    /quizzes/{id}/publish/             # Publish quiz
POST    /quizzes/{id}/unpublish/           # Unpublish quiz
GET     /quizzes/{id}/student_info/        # Quiz info for student
POST    /quizzes/{id}/start_attempt/       # Start new attempt
GET     /quizzes/lecture_quizzes/          # Quizzes for specific lecture/course

# Attempt Routes (/attempts/)
GET     /attempts/                         # List attempts
GET     /attempts/{id}/                    # Attempt details
PUT     /attempts/{id}/                    # Update attempt
PATCH   /attempts/{id}/                    # Partial attempt update
DELETE  /attempts/{id}/                    # Delete attempt
POST    /attempts/{id}/submit_answer/      # Submit answer
POST    /attempts/{id}/submit/             # Submit attempt
POST    /attempts/{id}/grade/              # Grade attempt
GET     /attempts/{id}/answers/            # Attempt answers
GET     /attempts/my_attempts/             # My attempts (student)
GET     /attempts/course_attempts/         # Attempts for course (teacher/admin)

# Question Routes (/questions/) - Optional
GET     /questions/                        # List questions
POST    /questions/                        # Create new question
GET     /questions/{id}/                   # Question details
PUT     /questions/{id}/                   # Full question update
PATCH   /questions/{id}/                   # Partial question update
DELETE  /questions/{id}/                   # Delete question

# Query parameters for questions:
# ?quiz_id={id} - Filter questions by quiz
"""