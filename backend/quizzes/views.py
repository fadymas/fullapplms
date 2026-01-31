# views.py
"""
Views for Quizzes Application
Handle API requests
"""

from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.exceptions import PermissionDenied, ValidationError as DRFValidationError
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q, Count, Avg, Max, Min
from django.contrib.auth.models import AnonymousUser

from .models import Quiz, Question, QuizAttempt, Answer
from .serializers import (
    QuizSerializer,
    QuizStudentSerializer,
    QuizAttemptSerializer,
    QuizAttemptCreateSerializer,
    AnswerSerializer,
    QuestionSerializer,
    AnswerSubmitSerializer,
    QuizGradeSerializer
)
from .services import QuizService
from .permissions import IsStudent, IsTeacher, IsAdmin, IsTeacherOrAdmin, IsCourseTeacherOrAdmin


class QuizViewSet(viewsets.ModelViewSet):
    """
    Quiz Management Interface
    """
    queryset = Quiz.objects.all().select_related('lecture', 'lecture__section__course')
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Select appropriate serializer based on user role
        """
        user = self.request.user
        # Check if user is authenticated and has role attribute
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return QuizSerializer
            
        if hasattr(user, 'role') and user.role == 'student':
            return QuizStudentSerializer
        return QuizSerializer
    
    def get_permissions(self):
        """
        Set permissions based on action
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'publish', 'unpublish']:
            return [IsTeacherOrAdmin()]
        
        if self.action in ['start_attempt']:
            return [IsStudent()]
        
        return super().get_permissions()
    
    def get_queryset(self):
        """
        Filter quizzes based on user role
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Check if user is authenticated
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return queryset.none()
        
        # Check if user has role attribute
        if not hasattr(user, 'role'):
            return queryset.none()
        
        if user.role == 'student':
            # Students see only published quizzes in courses they're enrolled in
            from courses.models import Enrollment
            enrolled_courses = Enrollment.objects.filter(
                student=user
            ).values_list('course_id', flat=True)
            
            # Get lectures from enrolled courses
            from courses.models import Lecture
            enrolled_lectures = Lecture.objects.filter(
                section__course_id__in=enrolled_courses
            ).values_list('id', flat=True)
            
            queryset = queryset.filter(
                lecture_id__in=enrolled_lectures,
                is_published=True
            )
            
        elif user.role == 'teacher':
            # Teachers see quizzes for lectures in courses they teach
            queryset = queryset.filter(lecture__section__course__instructor=user)
            
        elif user.role == 'admin':
            # Admins see all quizzes
            pass
        
        # Calculate statistics
        if self.action == 'list':
            queryset = queryset.annotate(
                question_count=Count('questions'),
                attempt_count=Count('attempts'),
                avg_score=Avg('attempts__score', filter=Q(attempts__status=QuizAttempt.Status.GRADED))
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Create new quiz
        """
        user = self.request.user
        
        # Check if user has role attribute
        if not hasattr(user, 'role'):
            raise PermissionDenied('User role not found.')
        
        # Check permission to create quiz for this lecture
        lecture = serializer.validated_data['lecture']
        
        if user.role == 'teacher' and lecture.section.course.instructor != user:
            raise PermissionDenied('You cannot create a quiz for a lecture in a course you do not teach.')
        
        serializer.save()
    
    def perform_update(self, serializer):
        """
        Update quiz
        """
        instance = self.get_object()
        user = self.request.user
        
        # Check if user has role attribute
        if not hasattr(user, 'role'):
            raise PermissionDenied('User role not found.')
        
        # Check edit permission
        if user.role == 'teacher' and instance.lecture.section.course.instructor != user:
            raise PermissionDenied('You cannot modify a quiz that does not belong to a course you teach.')
        
        # If quiz is published, only admin can modify
        if instance.is_published and user.role != 'admin':
            raise PermissionDenied('Cannot modify a published quiz except by admin.')
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Delete quiz
        """
        user = self.request.user
        
        # Check if user has role attribute
        if not hasattr(user, 'role'):
            raise PermissionDenied('User role not found.')
        
        # Check delete permission
        if user.role == 'teacher' and instance.lecture.section.course.instructor != user:
            raise PermissionDenied('You cannot delete a quiz that does not belong to a course you teach.')
        
        # If quiz is published, only admin can delete
        if instance.is_published and user.role != 'admin':
            raise PermissionDenied('Cannot delete a published quiz except by admin.')
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """
        Publish quiz
        """
        quiz = self.get_object()
        
        try:
            quiz = QuizService.publish_quiz(quiz, request.user)
            serializer = self.get_serializer(quiz)
            return Response(serializer.data)
        except DjangoValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """
        Unpublish quiz
        """
        quiz = self.get_object()
        
        try:
            quiz = QuizService.unpublish_quiz(quiz, request.user)
            serializer = self.get_serializer(quiz)
            return Response(serializer.data)
        except DjangoValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def student_info(self, request, pk=None):
        """
        Get quiz information for student
        """
        user = request.user
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not hasattr(user, 'role') or user.role != 'student':
            return Response(
                {'detail': 'This action is for students only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        quiz = self.get_object()
        info = QuizService.get_student_quiz_info(user, quiz)
        
        response_data = {
            'quiz': self.get_serializer(quiz).data,
            'can_take': info['can_take'],
            'reason': info['reason'],
            'remaining_attempts': info['remaining_attempts'],
            'previous_attempts': QuizAttemptSerializer(info['previous_attempts'], many=True).data,
            'best_score': info['best_score']
        }
        
        return Response(response_data)
    
    @action(detail=True, methods=['post'])
    def start_attempt(self, request, pk=None):
        """
        Start a new quiz attempt
        """
        user = request.user
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not hasattr(user, 'role') or user.role != 'student':
            return Response(
                {'detail': 'This action is for students only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        quiz = self.get_object()
        
        try:
            attempt = QuizService.start_attempt(user, quiz)
            serializer = QuizAttemptSerializer(attempt)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def lecture_quizzes(self, request):
        """
        Get quizzes for a specific lecture
        """
        user = request.user
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        lecture_id = request.query_params.get('lecture_id')
        course_id = request.query_params.get('course_id')
        
        if not lecture_id and not course_id:
            return Response(
                {'detail': 'Lecture ID or Course ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset()
        
        if lecture_id:
            queryset = queryset.filter(lecture_id=lecture_id)
        elif course_id:
            # Get all lectures for the course
            from courses.models import Lecture
            lecture_ids = Lecture.objects.filter(
                section__course_id=course_id
            ).values_list('id', flat=True)
            queryset = queryset.filter(lecture_id__in=lecture_ids)
        
        # Check permissions
        if not hasattr(user, 'role'):
            return Response(
                {'detail': 'User role not found.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if user.role == 'student':
            # Check if student is enrolled in the course
            if course_id:
                from courses.models import Enrollment
                if not Enrollment.objects.filter(student=user, course_id=course_id).exists():
                    return Response(
                        {'detail': 'You are not enrolled in this course.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            elif lecture_id:
                from courses.models import Lecture
                try:
                    lecture = Lecture.objects.get(id=lecture_id)
                    from courses.models import Enrollment
                    if not Enrollment.objects.filter(student=user, course=lecture.section.course).exists():
                        return Response(
                            {'detail': 'You are not enrolled in this course.'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Lecture.DoesNotExist:
                    return Response(
                        {'detail': 'Lecture not found.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        elif user.role == 'teacher':
            # Check if teacher teaches the course
            if course_id:
                from courses.models import Course
                try:
                    course = Course.objects.get(id=course_id)
                    if course.instructor != user:
                        return Response(
                            {'detail': 'You cannot access quizzes for a course you do not teach.'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Course.DoesNotExist:
                    return Response(
                        {'detail': 'Course not found.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            elif lecture_id:
                from courses.models import Lecture
                try:
                    lecture = Lecture.objects.get(id=lecture_id)
                    if lecture.section.course.instructor != user:
                        return Response(
                            {'detail': 'You cannot access quizzes for a lecture in a course you do not teach.'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Lecture.DoesNotExist:
                    return Response(
                        {'detail': 'Lecture not found.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response(serializer.data)


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """
    Quiz Attempts Management Interface
    """
    queryset = QuizAttempt.objects.all().select_related(
        'student', 'quiz', 'quiz__lecture__section__course', 'graded_by'
    ).prefetch_related('answers')
    
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Set permissions based on action
        """
        if self.action in ['list']:
            # For list view: allow only teachers and admins
            return [IsTeacherOrAdmin()]
        
        if self.action in ['submit_answer', 'submit']:
            return [IsStudent()]
        
        if self.action in ['grade']:
            return [IsTeacherOrAdmin()]
        
        # For retrieve, update, delete: fallback to default permissions
        return super().get_permissions()
    
    def get_queryset(self):
        """
        Filter attempts based on user role
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Check authentication
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return queryset.none()
        
        # Check if user has role attribute
        if not hasattr(user, 'role'):
            return queryset.none()
        
        # apply query parameters first
        quiz_id = self.request.query_params.get('quiz_id')
        student_id = self.request.query_params.get('student_id')
        
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # now apply permission constraints
        if user.role == 'student':
            # students: return their own attempts only
            queryset = queryset.filter(student=user)
                
        elif user.role == 'teacher':
            # teachers: restrict by course instructor
            queryset = queryset.filter(quiz__lecture__section__course__instructor=user)
                
        elif user.role == 'admin':
            # admins: allow all
            pass
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Creating attempts directly is not allowed
        """
        return Response(
            {'detail': 'Use /quizzes/{id}/start_attempt/ to start a new attempt.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def update(self, request, *args, **kwargs):
        """
        Update attempt (not allowed after submission)
        """
        instance = self.get_object()
        
        if instance.status != QuizAttempt.Status.IN_PROGRESS:
            return Response(
                {'detail': 'Cannot modify a submitted attempt.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)
    
    def perform_destroy(self, instance):
        """
        Delete attempt
        """
        user = self.request.user
        
        # Check if user has role attribute
        if not hasattr(user, 'role'):
            raise PermissionDenied('User role not found.')
        
        # only teacher or admin can delete attempts
        if user.role not in ['teacher', 'admin']:
            raise PermissionDenied("You don't have permission to delete attempts.")
        
        # ensure the teacher teaches the course
        if user.role == 'teacher' and instance.quiz.lecture.section.course.instructor != user:
            raise PermissionDenied('You cannot delete attempts for a quiz in a course you do not teach.')
        
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        """
        Submit an answer for a question in an attempt
        """
        user = request.user
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        attempt = self.get_object()
        
        # ensure attempt belongs to the current student
        if not hasattr(user, 'role') or user.role == 'student' and attempt.student != user:
            return Response(
                {'detail': 'You cannot access this attempt.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AnswerSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            answer = QuizService.submit_answer(
                attempt,
                serializer.validated_data['question_id'],
                serializer.validated_data
            )
            answer_serializer = AnswerSerializer(answer)
            return Response(answer_serializer.data)
        except DjangoValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """
        Submit the quiz attempt
        """
        user = request.user
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        attempt = self.get_object()
        
        # ensure attempt belongs to the current student
        if not hasattr(user, 'role') or user.role == 'student' and attempt.student != user:
            return Response(
                {'detail': 'You cannot access this attempt.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            attempt = QuizService.submit_attempt(attempt)
            serializer = self.get_serializer(attempt)
            return Response(serializer.data)
        except DjangoValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """
        Grade a quiz attempt (for essay questions)
        """
        user = request.user
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not hasattr(user, 'role'):
            return Response(
                {'detail': 'User role not found.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        attempt = self.get_object()
        
        # ensure teacher teaches the course
        if user.role == 'teacher' and attempt.quiz.lecture.section.course.instructor != user:
            return Response(
                {'detail': 'You cannot grade attempts for a quiz in a course you do not teach.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = QuizGradeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            attempt = QuizService.grade_attempt(
                attempt,
                user,
                serializer.validated_data['scores']
            )
            serializer = self.get_serializer(attempt)
            return Response(serializer.data)
        except DjangoValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def answers(self, request, pk=None):
        """
        Get answers for an attempt
        """
        user = request.user
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not hasattr(user, 'role'):
            return Response(
                {'detail': 'User role not found.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        attempt = self.get_object()
        
        # permission checks
        if user.role == 'student' and attempt.student != user:
            return Response(
                {'detail': 'You cannot access answers for this attempt.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if user.role == 'teacher' and attempt.quiz.lecture.section.course.instructor != user:
            return Response(
                {'detail': 'You cannot access answers for attempts of a quiz in a course you do not teach.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        answers = attempt.answers.all().select_related('question')
        serializer = AnswerSerializer(answers, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_attempts(self, request):
        """
        Get current user's attempts (students only)
        """
        user = request.user
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not hasattr(user, 'role') or user.role != 'student':
            return Response(
                {'detail': 'This action is for students only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # student-specific queryset
        attempts = QuizAttempt.objects.filter(student=user)
        
        # filter by quiz or status
        quiz_id = request.query_params.get('quiz_id')
        status_filter = request.query_params.get('status')
        
        if quiz_id:
            attempts = attempts.filter(quiz_id=quiz_id)
        
        if status_filter:
            attempts = attempts.filter(status=status_filter)
        
        serializer = self.get_serializer(attempts, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def course_attempts(self, request):
        """
        Get attempts for quizzes of a specific course (teachers and admins)
        """
        user = request.user
        if not user.is_authenticated or isinstance(user, AnonymousUser):
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not hasattr(user, 'role'):
            return Response(
                {'detail': 'User role not found.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        course_id = request.query_params.get('course_id')
        
        if not course_id:
            return Response(
                {'detail': 'Course ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from courses.models import Course
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'detail': 'Course not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # permission check
        if user.role == 'teacher' and course.instructor != user:
            return Response(
                {'detail': 'You cannot access attempts for quizzes of a course you do not teach.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # use queryset with permissions
        attempts = self.get_queryset().filter(quiz__lecture__section__course=course)
        
        # stats
        stats = {
            'total_attempts': attempts.count(),
            'graded_attempts': attempts.filter(status=QuizAttempt.Status.GRADED).count(),
            'average_score': attempts.filter(status=QuizAttempt.Status.GRADED).aggregate(
                avg_score=Avg('score')
            )['avg_score'],
            'pass_rate': None
        }
        
        # Calculate pass rate
        total_graded = attempts.filter(status=QuizAttempt.Status.GRADED).count()
        passed_count = attempts.filter(status=QuizAttempt.Status.GRADED, passed=True).count()
        
        if total_graded > 0:
            stats['pass_rate'] = (passed_count / total_graded) * 100
        
        serializer = self.get_serializer(attempts, many=True)
        
        response_data = {
            'attempts': serializer.data,
            'stats': stats
        }
        
        return Response(response_data)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Question management interface (optional - questions can be managed through quizzes)
    """
    queryset = Question.objects.all().select_related('quiz', 'quiz__lecture__section__course')
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def get_queryset(self):
        """
        Filter questions based on quiz
        """
        queryset = super().get_queryset()
        
        quiz_id = self.request.query_params.get('quiz_id')
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Create a new question
        """
        user = self.request.user
        
        # Check if user has role attribute
        if not hasattr(user, 'role'):
            raise PermissionDenied('User role not found.')
        
        # Try to get quiz from validated data, fallback to request data/query params
        quiz = serializer.validated_data.get('quiz')
        if not quiz:
            quiz_id = self.request.data.get('quiz') or self.request.query_params.get('quiz_id')
            if not quiz_id:
                raise DRFValidationError({'quiz': 'This field is required.'})
            try:
                quiz = Quiz.objects.get(id=quiz_id)
            except Quiz.DoesNotExist:
                raise DRFValidationError({'quiz': 'Quiz not found.'})

        # Check permission to add question to this quiz
        if user.role == 'teacher' and quiz.lecture.section.course.instructor != user:
            raise PermissionDenied('You cannot add a question to a quiz in a course you do not teach.')

        # Ensure quiz is passed to serializer.save() if it wasn't in validated_data
        if 'quiz' in serializer.validated_data:
            serializer.save()
        else:
            serializer.save(quiz=quiz)
    
    def perform_update(self, serializer):
        """
        Update question
        """
        instance = self.get_object()
        user = self.request.user
        
        # Check if user has role attribute
        if not hasattr(user, 'role'):
            raise PermissionDenied('User role not found.')
        
        # Check edit permission
        if user.role == 'teacher' and instance.quiz.lecture.section.course.instructor != user:
            raise PermissionDenied('You cannot modify a question for a quiz in a course you do not teach.')
        
        # If quiz is published, only admin can modify
        if instance.quiz.is_published and user.role != 'admin':
            raise PermissionDenied('Cannot modify a question in a published quiz except by admin.')
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Delete question
        """
        user = self.request.user
        
        # Check if user has role attribute
        if not hasattr(user, 'role'):
            raise PermissionDenied('User role not found.')
        
        # Check delete permission
        if user.role == 'teacher' and instance.quiz.lecture.section.course.instructor != user:
            raise PermissionDenied('You cannot delete a question for a quiz in a course you do not teach.')
        
        # If quiz is published, only admin can delete
        if instance.quiz.is_published and user.role != 'admin':
            raise PermissionDenied('Cannot delete a question from a published quiz except by admin.')
        
        instance.delete()