"""
Serializers for courses app.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Course, Section, Lecture, LectureFile, Enrollment, LectureProgress,
    Quiz, Question, QuestionOption, QuizAttempt, AttemptAnswer
)

User = get_user_model()


class LectureFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LectureFile
        # Include `lecture` so creation payload can specify the parent lecture
        fields = ['id', 'lecture', 'title', 'description', 'file', 'is_free', 'created_at']
        read_only_fields = ['created_at']


class LectureSerializer(serializers.ModelSerializer):
    files = LectureFileSerializer(many=True, read_only=True)
    prerequisite_title = serializers.CharField(source='prerequisite.title', read_only=True)
    
    class Meta:
        model = Lecture
        fields = [
            'id', 'title', 'description', 'content', 'video_url',
            'lecture_type', 'prerequisite', 'prerequisite_title',
            'order', 'is_free', 'duration_minutes', 'files',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SectionSerializer(serializers.ModelSerializer):
    lectures = LectureSerializer(many=True, read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Section
        fields = [
            'id', 'course', 'course_title', 'title', 'description', 'order', 'lectures',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SectionNoLecturesSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Section
        fields = [
            'id', 'course', 'course_title', 'title', 'description', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating courses."""
    
    class Meta:
        model = Course
        fields = [
            'title', 'description', 'instructor', 'price', 'thumbnail',
            'category', 'tags', 'difficulty_level'
        ]
    
    def validate_instructor(self, value):
        """Ensure instructor is teacher or admin."""
        if value and value.role not in ['teacher', 'admin']:
            raise serializers.ValidationError(
                'Instructor must be a teacher or admin.'
            )
        return value


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for course lists."""
    instructor_name = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'instructor', 'instructor_name',
            'status', 'price', 'thumbnail', 'category', 'tags', 'difficulty_level',
            'student_count', 'published_at', 'created_at'
        ]
        read_only_fields = ['published_at', 'created_at']
    
    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() if obj.instructor else None
    
    def get_student_count(self, obj):
        return obj.enrollments.count()


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for course view."""
    sections = SectionSerializer(many=True, read_only=True)
    instructor_name = serializers.SerializerMethodField()
    instructor_email = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    is_purchased = serializers.SerializerMethodField()
    can_access_content = serializers.SerializerMethodField()  # ?? ????? ??? ????
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'instructor', 'instructor_name',
            'instructor_email', 'status', 'price', 'price_locked', 'thumbnail',
            'category', 'tags', 'difficulty_level', 'sections',
            'student_count', 'is_enrolled', 'is_purchased', 'can_access_content',
            'published_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['published_at', 'created_at', 'updated_at', 'price_locked']
    
    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() if obj.instructor else None
    
    def get_instructor_email(self, obj):
        return obj.instructor.email if obj.instructor else None
    
    def get_student_count(self, obj):
        return obj.enrollments.count()
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return Enrollment.objects.filter(
                student=request.user,
                course=obj
            ).exists()
        return False
    
    def get_is_purchased(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            from payments.models import Purchase
            return Purchase.objects.filter(
                student=request.user,
                course=obj,
                refunded=False
            ).exists()
        return False
    
    def get_can_access_content(self, obj):  # ?? method ????
        """???? ??? ??? ???????? ????? ?????? ??????? ??????"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # ?????? ????????? ?????? ?????? ??? ???
            if request.user.role in ['admin', 'teacher']:
                return True
            
            # ?????? ??????? ?????? ?? ?? ???? ?????? ?????
            if request.user.role == 'student':
                from payments.models import Purchase
                return Purchase.objects.filter(
                    student=request.user,
                    course=obj,
                    refunded=False
                ).exists() or obj.price == 0
        
        return False


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_email', 'course', 'course_title',
            'enrolled_at', 'completed_at', 'progress_percentage'
        ]
        read_only_fields = ['enrolled_at', 'completed_at', 'progress_percentage']


class LectureProgressSerializer(serializers.ModelSerializer):
    lecture_title = serializers.CharField(source='lecture.title', read_only=True)
    
    class Meta:
        model = LectureProgress
        fields = [
            'id', 'enrollment', 'lecture', 'lecture_title',
            'started_at', 'completed_at', 'completed', 'watch_time_seconds'
        ]
        read_only_fields = ['started_at', 'completed_at']


class SectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating sections."""
    
    class Meta:
        model = Section
        fields = ['course', 'title', 'description', 'order']


class LectureCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating lectures."""
    
    class Meta:
        model = Lecture
        fields = [
            'section', 'title', 'description', 'content', 'video_url',
            'lecture_type', 'prerequisite', 'order', 'is_free', 'duration_minutes'
        ]
    
    def validate(self, data):
        """Validate that prerequisite is in the same course."""
        prerequisite = data.get('prerequisite')
        section = data.get('section') or (self.instance.section if self.instance else None)
        
        if prerequisite and section:
            if prerequisite.section.course != section.course:
                raise serializers.ValidationError({
                    'prerequisite': 'Prerequisite must be in the same course.'
                })
        
        return data


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)
    # Accept legacy 'type' or client 'question_type'
    question_type = serializers.CharField(write_only=True, required=False)
    # Accept nested creation of options
    answer_options = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        ref_name = 'CoursesQuestionSerializer'
        model = Question
        fields = ['id', 'quiz', 'order', 'type', 'question_type', 'text', 'points', 'options', 'answer_options']
        read_only_fields = ['quiz']

    def validate(self, attrs):
        # Map question_type -> type if provided
        qtype = attrs.get('question_type')
        if qtype:
            attrs['type'] = qtype
        if 'type' not in attrs and not self.instance:
            raise serializers.ValidationError({'type': 'This field is required.'})
        return attrs

    def create(self, validated_data):
        answer_opts = validated_data.pop('answer_options', None)
        # remove helper key if present
        validated_data.pop('question_type', None)
        question = super().create(validated_data)
        if answer_opts:
            for idx, o in enumerate(answer_opts):
                QuestionOption.objects.create(
                    question=question,
                    text=o.get('text') or o.get('label') or '',
                    is_correct=bool(o.get('is_correct', False)),
                    order=o.get('order', idx)
                )
        return question

    def update(self, instance, validated_data):
        answer_opts = validated_data.pop('answer_options', None)
        validated_data.pop('question_type', None)
        question = super().update(instance, validated_data)
        if answer_opts is not None:
            # replace existing options
            instance.options.all().delete()
            for idx, o in enumerate(answer_opts):
                QuestionOption.objects.create(
                    question=instance,
                    text=o.get('text') or o.get('label') or '',
                    is_correct=bool(o.get('is_correct', False)),
                    order=o.get('order', idx)
                )
        return question


class QuizSerializer(serializers.ModelSerializer):
    lecture_id = serializers.PrimaryKeyRelatedField(source='lecture', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'lecture_id', 'title', 'description', 'time_limit_seconds',
            'max_attempts', 'randomize_questions', 'is_mandatory', 'status',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class QuizDetailSerializer(QuizSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta(QuizSerializer.Meta):
        fields = QuizSerializer.Meta.fields + ['questions']


class AttemptAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttemptAnswer
        fields = ['id', 'question', 'answer_payload', 'is_correct', 'award_points', 'graded_by', 'graded_at']
        read_only_fields = ['is_correct', 'award_points', 'graded_by', 'graded_at']


class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = AttemptAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        ref_name = 'CoursesQuizAttemptSerializer'
        fields = ['id', 'quiz', 'lecture', 'student', 'started_at', 'submitted_at', 'status', 'score', 'attempt_number', 'meta', 'answers']
        read_only_fields = ['student', 'started_at', 'submitted_at', 'status', 'score', 'attempt_number', 'meta']


class QuizAttemptStartSerializer(serializers.ModelSerializer):
    # serialized view returned to student when starting attempt: includes questions but not correct answers
    questions = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'lecture', 'started_at', 'time_limit_seconds', 'questions']

    def get_questions(self, obj):
        # return question payload without revealing correctness
        qs = obj.quiz.questions.all().order_by('order')
        result = []
        for q in qs:
            options = []
            for o in q.options.all().order_by('order'):
                options.append({'id': o.id, 'text': o.text})
            result.append({'id': q.id, 'type': q.type, 'text': q.text, 'options': options, 'points': str(q.points)})
        return result