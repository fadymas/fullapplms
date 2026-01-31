"""
Views for courses app.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import FileResponse, Http404
from django_filters.rest_framework import DjangoFilterBackend
import os
from users.permissions import IsAdminUser, IsTeacherUser, IsStudentUser, IsAdminOrTeacherUser
from .models import Course, Section, Lecture, LectureFile, Enrollment, LectureProgress
from .serializers import (
    CourseCreateSerializer, CourseListSerializer, CourseDetailSerializer,
    SectionSerializer, SectionCreateSerializer,
    LectureSerializer, LectureCreateSerializer,
    LectureFileSerializer,
    EnrollmentSerializer, LectureProgressSerializer
)
from .services import CourseService, EnrollmentService
from .permissions import IsCourseInstructorOrAdmin, CanAccessCourse, IsEnrolledStudent, HasPurchasedCourse, CourseContentAccessPermission
from .serializers import (
    QuizSerializer, QuizDetailSerializer, QuestionSerializer, QuestionOptionSerializer,
    QuizAttemptSerializer, QuizAttemptStartSerializer, AttemptAnswerSerializer
)
from .models import Quiz, Question, QuestionOption, QuizAttempt, AttemptAnswer


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for course management."""
    queryset = Course.objects.active().select_related('instructor')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'difficulty_level', 'instructor']
    search_fields = ['title', 'description', 'category', 'tags']
    ordering_fields = ['created_at', 'published_at', 'price', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CourseCreateSerializer
        if self.action == 'list':
            return CourseListSerializer
        return CourseDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        """Retrieve course detail, but hide lectures for non-enrolled students.

        Reuse `CourseDetailSerializer` for course fields, then replace the
        `sections` payload with a no-lectures representation when the
        requesting student is not enrolled.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # If requester is a student and not enrolled, replace sections
        if request.user.is_authenticated and request.user.role == 'student':
            from .models import Enrollment
            enrolled = Enrollment.objects.filter(student=request.user, course=instance).exists()
            if not enrolled:
                sections_qs = Section.objects.filter(course=instance, deleted_at__isnull=True)
                from .serializers import SectionNoLecturesSerializer
                sections_ser = SectionNoLecturesSerializer(sections_qs, many=True, context={'request': request})
                data['sections'] = sections_ser.data

        return Response(data)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Apply filters
        status_filter = self.request.query_params.get('status')
        category_filter = self.request.query_params.get('category')
        difficulty_filter = self.request.query_params.get('difficulty_level')
        instructor_filter = self.request.query_params.get('instructor')
        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')
        search_query = self.request.query_params.get('search')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category_filter:
            queryset = queryset.filter(category=category_filter)
        if difficulty_filter:
            queryset = queryset.filter(difficulty_level=difficulty_filter)
        if instructor_filter:
            queryset = queryset.filter(instructor_id=instructor_filter)
        if price_min:
            queryset = queryset.filter(price__gte=price_min)
        if price_max:
            queryset = queryset.filter(price__lte=price_max)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__icontains=search_query) |
                Q(tags__icontains=search_query)
            )
        
        # Role-based filtering
        if self.request.user.role == 'student':
            # `queryset` is a QuerySet instance; use filter instead of manager method
            queryset = queryset.filter(status=Course.Status.PUBLISHED, deleted_at__isnull=True)
        elif self.request.user.role == 'teacher':
            # Use queryset filtering instead of manager method to avoid
            # calling manager-only methods on a QuerySet instance.
            queryset = queryset.filter(instructor=self.request.user)
        # Admins see all courses
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['create']:
            return [IsAdminOrTeacherUser()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsCourseInstructorOrAdmin()]
        elif self.action in ['approve', 'reject', 'delete_course']:
            return [IsAdminUser()]
        elif self.action in ['retrieve', 'list']:  # ?? ????? ??? ???
            # ?????? ?????? ????? ??????? ?????? ????????
            return [IsAuthenticated()]
        elif self.action in ['content']:  # ?? ??????? ?????? ????? ????
            return [IsAuthenticated(), CourseContentAccessPermission()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Create course with proper instructor assignment."""
        user = self.request.user
        validated_data = serializer.validated_data.copy()
        
        # Determine instructor
        if user.role == 'teacher':
            instructor = user
            validated_data['status'] = Course.Status.DRAFT
        elif user.role == 'admin':
            instructor = validated_data.pop('instructor', user)
        else:
            instructor = user
        
        # Remove instructor from data dict since it's passed separately
        validated_data.pop('instructor', None)
        
        # Use service for creation to ensure audit logging
        course = CourseService.create_course(
            instructor=instructor,
            data=validated_data
        )
        serializer.instance = course
    
    @action(detail=True, methods=['post'], url_path='upload-thumbnail')
    def upload_thumbnail(self, request, pk=None):
        """Upload course thumbnail."""
        course = self.get_object()
        # Check permissions
        if request.user.role == 'teacher' and course.instructor != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only upload thumbnails for your own courses.')
        if request.user.role == 'student':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Students cannot upload course thumbnails.')
        
        if 'thumbnail' not in request.FILES:
            return Response(
                {'error': 'No thumbnail file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        course.thumbnail = request.FILES['thumbnail']
        course.save(update_fields=['thumbnail'])
        serializer = self.get_serializer(course)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, pk=None):
        """Submit course for admin approval."""
        course = self.get_object()
        CourseService.submit_for_approval(course, request.user)
        return Response({'status': 'Course submitted for approval'})
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve course (admin only)."""
        course = self.get_object()
        reason = request.data.get('reason')
        CourseService.approve_course(course, request.user, reason)
        return Response({'status': 'Course approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject course (admin only)."""
        course = self.get_object()
        reason = request.data.get('reason', '')
        if not reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        CourseService.reject_course(course, request.user, reason)
        return Response({'status': 'Course rejected'})
    
    @action(detail=True, methods=['post'])
    def delete_course(self, request, pk=None):
        """Delete course (admin only, with optional refund)."""
        course = self.get_object()
        refund_students = request.data.get('refund_students', False)
        reason = request.data.get('reason', '')
        CourseService.delete_course(course, request.user, refund_students, reason)
        return Response({'status': 'Course deleted'})
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated, CourseContentAccessPermission])  # ?? ????? ???
    def content(self, request, pk=None):
        """Get course content (sections and lectures).

        If the requesting user is a student, only show lectures when the
        student is enrolled in the course. Otherwise return sections without
        lecture details.
        """
        course = self.get_object()
        sections = Section.objects.filter(
            course=course,
            deleted_at__isnull=True
        ).prefetch_related('lectures__files')

        # Student-specific behavior: verify enrollment
        if request.user.is_authenticated and request.user.role == 'student':
            from .models import Enrollment
            enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
            if enrolled:
                serializer = SectionSerializer(sections, many=True, context={'request': request})
            else:
                from .serializers import SectionNoLecturesSerializer
                serializer = SectionNoLecturesSerializer(sections, many=True, context={'request': request})
        else:
            # Teachers and admins see full content
            serializer = SectionSerializer(sections, many=True, context={'request': request})

        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get list of all course categories."""
        categories = Course.objects.active().exclude(
            category__isnull=True
        ).exclude(
            category=''
        ).values_list('category', flat=True).distinct()
        return Response({'categories': list(categories)})
    
    @action(detail=False, methods=['get'])
    def tags(self, request):
        """Get list of all course tags."""
        tags = set()
        for course in Course.objects.active().exclude(tags__isnull=True):
            if course.tags:
                tags.update(course.tags)
        return Response({'tags': list(tags)})


class SectionViewSet(viewsets.ModelViewSet):
    """ViewSet for course section management."""
    queryset = Section.objects.filter(deleted_at__isnull=True).select_related('course')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SectionCreateSerializer
        return SectionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course')
        
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Role-based filtering
        if self.request.user.role == 'student':
            # Students can only see sections of published courses they're enrolled in
            from .models import Enrollment
            enrolled_courses = Enrollment.objects.filter(
                student=self.request.user
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(
                course__status=Course.Status.PUBLISHED,
                course_id__in=enrolled_courses
            )
        elif self.request.user.role == 'teacher':
            # Teachers see sections of their own courses
            queryset = queryset.filter(course__instructor=self.request.user)
        # Admins see all sections
        
        return queryset.order_by('order', 'created_at')
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsCourseInstructorOrAdmin()]
        # For read-only access, ensure student has purchased the course
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsAuthenticated(), CourseContentAccessPermission()]  # ?? ????? ???
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Create section with permission check."""
        course = serializer.validated_data['course']
        # Check permission
        if self.request.user.role == 'teacher' and course.instructor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only create sections for your own courses.')
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def reorder(self, request, pk=None):
        """Reorder sections within a course."""
        section = self.get_object()
        new_order = request.data.get('order')
        if new_order is None:
            return Response(
                {'error': 'Order is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order
        section.order = new_order
        section.save(update_fields=['order'])
        
        serializer = self.get_serializer(section)
        return Response(serializer.data)


class LectureViewSet(viewsets.ModelViewSet):
    """ViewSet for lecture management."""
    queryset = Lecture.objects.filter(deleted_at__isnull=True).select_related('section', 'prerequisite')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['lecture_type', 'is_free', 'section']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return LectureCreateSerializer
        return LectureSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        section_id = self.request.query_params.get('section')
        course_id = self.request.query_params.get('course')
        
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        if course_id:
            queryset = queryset.filter(section__course_id=course_id)
        
        # Role-based filtering
        if self.request.user.role == 'student':
            # Students can only see lectures of published courses they're enrolled in
            from .models import Enrollment
            enrolled_courses = Enrollment.objects.filter(
                student=self.request.user
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(
                section__course__status=Course.Status.PUBLISHED,
                section__course_id__in=enrolled_courses
            )
        elif self.request.user.role == 'teacher':
            # Teachers see lectures of their own courses
            queryset = queryset.filter(section__course__instructor=self.request.user)
        # Admins see all lectures
        
        return queryset.order_by('order', 'created_at')
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsCourseInstructorOrAdmin()]
        # Read-only access to lectures requires purchase
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsAuthenticated(), CourseContentAccessPermission()]  # ?? ????? ???
        return super().get_permissions()
    
    def get_serializer_context(self):
        """Add section to context for validation."""
        context = super().get_serializer_context()
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            section_id = self.request.data.get('section')
            if section_id:
                try:
                    section = Section.objects.get(pk=section_id)
                    context['section'] = section
                except Section.DoesNotExist:
                    pass
        return context
    
    def perform_create(self, serializer):
        """Create lecture with permission check."""
        section = serializer.validated_data['section']
        course = section.course
        # Check permission
        if self.request.user.role == 'teacher' and course.instructor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only create lectures for your own courses.')
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def reorder(self, request, pk=None):
        """Reorder lectures within a section."""
        lecture = self.get_object()
        new_order = request.data.get('order')
        if new_order is None:
            return Response(
                {'error': 'Order is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order
        lecture.order = new_order
        lecture.save(update_fields=['order'])
        
        serializer = self.get_serializer(lecture)
        return Response(serializer.data)


class LectureFileViewSet(viewsets.ModelViewSet):
    """ViewSet for lecture file management."""
    queryset = LectureFile.objects.filter(deleted_at__isnull=True).select_related('lecture')
    serializer_class = LectureFileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        lecture_id = self.request.query_params.get('lecture')
        
        if lecture_id:
            queryset = queryset.filter(lecture_id=lecture_id)
        
        # Role-based filtering
        if self.request.user.role == 'student':
            # Students can only see files of published courses they're enrolled in
            from .models import Enrollment
            enrolled_courses = Enrollment.objects.filter(
                student=self.request.user
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(
                lecture__section__course__status=Course.Status.PUBLISHED,
                lecture__section__course_id__in=enrolled_courses
            )
        elif self.request.user.role == 'teacher':
            # Teachers see files of their own courses
            queryset = queryset.filter(lecture__section__course__instructor=self.request.user)
        # Admins see all files
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsCourseInstructorOrAdmin()]
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsAuthenticated(), CourseContentAccessPermission()]  # ?? ????? ???
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Create lecture file with permission check."""
        lecture = serializer.validated_data['lecture']
        course = lecture.section.course
        # Check permission
        if self.request.user.role == 'teacher' and course.instructor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only upload files for your own courses.')
        serializer.save()


class QuizViewSet(viewsets.ModelViewSet):
    """Manage quizzes attached to lectures."""
    queryset = Quiz.objects.filter(deleted_at__isnull=True).select_related('lecture')
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Read-only access to quizzes requires purchase
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsAuthenticated(), CourseContentAccessPermission()]  # ?? ????? ???
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return QuizDetailSerializer
        return QuizSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        lecture_id = self.kwargs.get('lecture_id') or self.request.query_params.get('lecture')
        if lecture_id:
            queryset = queryset.filter(lecture_id=lecture_id)

        # Teachers see only their lectures' quizzes
        if self.request.user.role == 'teacher':
            queryset = queryset.filter(lecture__course__instructor=self.request.user)

        return queryset

    def perform_create(self, serializer):
        lecture_id = self.kwargs.get('lecture_id') or self.request.data.get('lecture')
        lecture = Lecture.objects.get(pk=lecture_id)
        # ensure teacher owns the lecture
        if self.request.user.role == 'teacher' and lecture.course.instructor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only create quizzes for your own lectures.')
        serializer.save(lecture=lecture, created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None, lecture_id=None):
        quiz = self.get_object()
        # minimal validation: must have at least one question
        if not quiz.questions.exists():
            return Response({'error': 'Quiz must have at least one question before publishing.'}, status=status.HTTP_400_BAD_REQUEST)
        quiz.status = Quiz.Status.PUBLISHED
        quiz.save(update_fields=['status'])
        return Response({'status': 'published'})


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().prefetch_related('options')
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [IsAuthenticated(), CourseContentAccessPermission()]  # ?? ????? ???
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        quiz_id = self.kwargs.get('quiz_id') or self.request.query_params.get('quiz')
        if quiz_id:
            qs = qs.filter(quiz_id=quiz_id)
        # If teacher, restrict to their quizzes
        if self.request.user.role == 'teacher':
            qs = qs.filter(quiz__lecture__course__instructor=self.request.user)
        return qs

    def perform_create(self, serializer):
        quiz_id = self.kwargs.get('quiz_id') or self.request.data.get('quiz')
        quiz = get_object_or_404(Quiz, pk=quiz_id)
        # disallow changes if attempts exist
        if quiz.attempts.exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Cannot add questions after attempts exist.')
        serializer.save(quiz=quiz)


class QuizAttemptViewSet(viewsets.ModelViewSet):
    queryset = QuizAttempt.objects.all().select_related('quiz', 'student')
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        # students only see own attempts
        if self.request.user.role == 'student':
            qs = qs.filter(student=self.request.user)
        elif self.request.user.role == 'teacher':
            qs = qs.filter(quiz__lecture__course__instructor=self.request.user)
        return qs

    def create(self, request, *args, **kwargs):
        # start attempt
        quiz_id = self.kwargs.get('quiz_id') or request.data.get('quiz')
        quiz = get_object_or_404(Quiz, pk=quiz_id, status=Quiz.Status.PUBLISHED)
        # check enrollment
        from .models import Enrollment
        enrolled = Enrollment.objects.filter(student=request.user, course=quiz.lecture.section.course).exists()
        if not enrolled and request.user.role == 'student':
            return Response({'error': 'Not enrolled in course.'}, status=status.HTTP_403_FORBIDDEN)
        # enforce max_attempts
        attempts_count = QuizAttempt.objects.filter(quiz=quiz, student=request.user).count()
        if quiz.max_attempts and attempts_count >= quiz.max_attempts:
            return Response({'error': 'Max attempts exceeded.'}, status=status.HTTP_400_BAD_REQUEST)

        attempt_number = attempts_count + 1
        attempt = QuizAttempt.objects.create(quiz=quiz, lecture=quiz.lecture, student=request.user, attempt_number=attempt_number)
        serializer = QuizAttemptStartSerializer(attempt, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        attempt = self.get_object()
        if attempt.student != request.user and request.user.role != 'admin' and request.user.role != 'teacher':
            return Response({'error': 'Not permitted'}, status=status.HTTP_403_FORBIDDEN)
        if attempt.status != QuizAttempt.Status.IN_PROGRESS:
            return Response({'error': 'Attempt not in progress'}, status=status.HTTP_400_BAD_REQUEST)

        # accept answers payload
        answers = request.data.get('answers', [])
        total_points = 0
        awarded = 0
        for a in answers:
            qid = a.get('question_id')
            try:
                q = Question.objects.get(pk=qid)
            except Question.DoesNotExist:
                continue
            payload = a.get('answer')
            aa, _ = AttemptAnswer.objects.get_or_create(attempt=attempt, question=q, defaults={'answer_payload': payload})
            aa.answer_payload = payload
            # auto-grade MCQ and TF
            if q.type in [Question.Type.MCQ, Question.Type.TRUE_FALSE]:
                # payload for MCQ expected as {'option_ids': [1,2]}
                option_ids = payload.get('option_ids', []) if isinstance(payload, dict) else []
                correct_options = list(q.options.filter(is_correct=True).values_list('id', flat=True))
                is_correct = set(option_ids) == set(correct_options)
                aa.is_correct = is_correct
                aa.award_points = q.points if is_correct else 0
                awarded += float(aa.award_points or 0)
                total_points += float(q.points or 0)
            else:
                # essay: leave for manual grading
                aa.is_correct = None
            aa.save()

        attempt.submitted_at = timezone.now()
        attempt.status = QuizAttempt.Status.SUBMITTED
        # compute provisional score
        attempt.score = awarded if total_points > 0 else None
        attempt.save(update_fields=['submitted_at', 'status', 'score'])

        # if no essays, mark graded
        has_essay = attempt.answers.filter(question__type=Question.Type.ESSAY).exists()
        if not has_essay:
            attempt.status = QuizAttempt.Status.GRADED
            attempt.save(update_fields=['status'])
            # if mandatory and passed -> mark lecture complete
            if attempt.quiz.is_mandatory and (attempt.score or 0) >= 0:
                # simplistic pass rule: any non-zero score
                from .models import Enrollment
                try:
                    enrollment = Enrollment.objects.get(student=attempt.student, course=attempt.quiz.lecture.section.course)
                    # mark lecture progress
                    from .models import LectureProgress
                    lp, _ = LectureProgress.objects.get_or_create(enrollment=enrollment, lecture=attempt.lecture)
                    lp.mark_completed()
                except Enrollment.DoesNotExist:
                    pass

        return Response({'status': 'submitted', 'score': attempt.score})


class EnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for course enrollments."""
    queryset = Enrollment.objects.all().select_related('student', 'course')
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        if self.request.user.role == 'student':
            queryset = queryset.filter(student=self.request.user)
        elif self.request.user.role == 'teacher':
            queryset = queryset.filter(course__instructor=self.request.user)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def enroll(self, request):
        """Enroll in a course."""
        course_id = request.data.get('course_id')
        course = get_object_or_404(Course, pk=course_id)
        
        try:
            enrollment = EnrollmentService.enroll_student(request.user, course)
            serializer = self.get_serializer(enrollment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class LectureProgressViewSet(viewsets.ModelViewSet):
    """ViewSet for lecture progress tracking."""
    queryset = LectureProgress.objects.all().select_related('enrollment', 'lecture')
    serializer_class = LectureProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        if self.request.user.role == 'student':
            queryset = queryset.filter(enrollment__student=self.request.user)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark lecture as completed."""
        progress = self.get_object()
        progress.mark_completed()
        serializer = self.get_serializer(progress)
        return Response(serializer.data)


class SecureFileDownloadView(APIView):
    """
    SECURITY FIX: Secure file download endpoint that verifies enrollment
    before serving lecture files.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, file_id):
        """Download a lecture file with enrollment verification."""
        try:
            lecture_file = LectureFile.objects.select_related(
                'lecture__section__course'
            ).get(pk=file_id, deleted_at__isnull=True)
        except LectureFile.DoesNotExist:
            raise Http404("File not found")
        
        course = lecture_file.lecture.section.course
        user = request.user
        
        # Check if file is free (accessible to all)
        if lecture_file.is_free:
            # Free files are accessible to authenticated users
            pass
        # Instructors and admins can access all files
        elif user.role in ['admin', 'teacher'] and (
            user.role == 'admin' or course.instructor == user
        ):
            pass
        # Students must be enrolled
        elif user.role == 'student':
            enrolled = Enrollment.objects.filter(
                student=user,
                course=course
            ).exists()
            if not enrolled:
                return Response(
                    {"error": "You must be enrolled in this course to access this file."},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {"error": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Serve the file
        file_path = lecture_file.file.path
        if not os.path.exists(file_path):
            raise Http404("File not found on disk")
        
        response = FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=os.path.basename(file_path)
        )
        return response