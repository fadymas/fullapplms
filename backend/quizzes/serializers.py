# serializers.py
"""
Serializers for Quizzes Application
Convert data to/from JSON for API
"""

from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from decimal import Decimal
from django.contrib.auth.models import AnonymousUser

from .models import Quiz, Question, QuizAttempt, Answer
from .validators import validate_passing_grade, validate_positive_points


class QuestionSerializer(serializers.ModelSerializer):
    """
    Question serializer for admins/teachers (includes correct answer)
    """
    class Meta:
        ref_name = 'QuizzesQuestionSerializer'
        model = Question
        fields = [
            'quiz',
            'id',
            'question_type',
            'text',
            'order',
            'points',
            'options',
            'correct_answer',
            'created_at'
        ]
        read_only_fields = ['created_at']
    
    def validate(self, data):
        """
        Comprehensive question data validation
        """
        question_type = data.get('question_type')
        options = data.get('options', [])
        correct_answer = data.get('correct_answer')
        
        if question_type in ['multiple_choice', 'true_false']:
            if not options or len(options) < 2:
                raise ValidationError({'options': 'Question must have at least 2 options.'})
            
            if not correct_answer:
                raise ValidationError({'correct_answer': 'Question must have a correct answer.'})
            
            if correct_answer not in options:
                raise ValidationError({'correct_answer': 'Correct answer must be one of the available options.'})
        
        elif question_type == 'essay':
            # Essay questions don't need options or correct answer
            data['options'] = []
            data['correct_answer'] = None
        
        return data
    
    def validate_points(self, value):
        """
        Validate question points
        """
        if value <= Decimal('0'):
            raise ValidationError('Question points must be greater than zero.')
        return value


class QuizSerializer(serializers.ModelSerializer):
    """
    Quiz serializer for admins/teachers
    """
    questions = QuestionSerializer(many=True, required=False)
    question_count = serializers.IntegerField(source='questions.count', read_only=True)
    total_points = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    lecture_title = serializers.CharField(source='lecture.title', read_only=True)
    
    class Meta:
        model = Quiz
        fields = [
            'id',
            'lecture',
            'course_title',
            'lecture_title',
            'title',
            'description',
            'is_mandatory',
            'passing_grade',
            'max_attempts',
            'grading_method',
            'time_limit_minutes',
            'is_published',
            'questions',
            'question_count',
            'total_points',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_total_points(self, obj):
        """
        Calculate total quiz points
        """
        return obj.get_total_points()
    
    def get_course_title(self, obj):
        """
        Get course title through lecture.section.course
        """
        if obj.lecture and obj.lecture.section and obj.lecture.section.course:
            return obj.lecture.section.course.title
        return None
    
    def validate(self, data):
        """
        Comprehensive quiz data validation
        """
        passing_grade = data.get('passing_grade')
        if passing_grade and (passing_grade < Decimal('0') or passing_grade > Decimal('100')):
            raise ValidationError({'passing_grade': 'Passing grade must be between 0 and 100.'})
        
        max_attempts = data.get('max_attempts')
        if max_attempts and max_attempts < 1:
            raise ValidationError({'max_attempts': 'Number of attempts must be at least 1.'})
        
        time_limit = data.get('time_limit_minutes')
        if time_limit is not None and time_limit < 1:
            raise ValidationError({'time_limit_minutes': 'Time limit must be at least 1 minute.'})
        
        return data
    
    def create(self, validated_data):
        """
        Create quiz with questions
        """
        questions_data = validated_data.pop('questions', [])
        quiz = Quiz.objects.create(**validated_data)
        
        for question_data in questions_data:
            Question.objects.create(quiz=quiz, **question_data)
        
        return quiz
    
    def update(self, instance, validated_data):
        """
        Update quiz with questions
        """
        questions_data = validated_data.pop('questions', None)
        
        # Update quiz data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update questions if provided
        if questions_data is not None:
            # Delete old questions and add new ones
            instance.questions.all().delete()
            for question_data in questions_data:
                Question.objects.create(quiz=instance, **question_data)
        
        return instance


class QuestionStudentSerializer(serializers.ModelSerializer):
    """
    Question serializer for students (hides correct answer)
    """
    class Meta:
        model = Question
        fields = [
            'id',
            'question_type',
            'text',
            'order',
            'points',
            'options',
            'created_at'
        ]
        read_only_fields = ['created_at']


class QuizStudentSerializer(serializers.ModelSerializer):
    """
    Quiz serializer for students
    """
    questions = QuestionStudentSerializer(many=True, read_only=True)
    question_count = serializers.IntegerField(source='questions.count', read_only=True)
    total_points = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    lecture_title = serializers.CharField(source='lecture.title', read_only=True)
    can_take = serializers.SerializerMethodField()
    remaining_attempts = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id',
            'lecture',
            'course_title',
            'lecture_title',
            'title',
            'description',
            'is_mandatory',
            'passing_grade',
            'max_attempts',
            'grading_method',
            'time_limit_minutes',
            'questions',
            'question_count',
            'total_points',
            'can_take',
            'remaining_attempts',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_total_points(self, obj):
        return obj.get_total_points()
    
    def get_course_title(self, obj):
        """
        Get course title through lecture.section.course
        """
        if obj.lecture and obj.lecture.section and obj.lecture.section.course:
            return obj.lecture.section.course.title
        return None
    
    def get_can_take(self, obj):
        """
        Check if student can take the quiz
        """
        request = self.context.get('request')
        if not request or not request.user or isinstance(request.user, AnonymousUser):
            return False
        
        student = request.user
        if not hasattr(student, 'role') or student.role != 'student':
            return False
            
        can_take, _ = obj.can_student_take(student)
        return can_take
    
    def get_remaining_attempts(self, obj):
        """
        Calculate remaining attempts
        """
        request = self.context.get('request')
        if not request or not request.user or isinstance(request.user, AnonymousUser):
            return 0
        
        student = request.user
        if not hasattr(student, 'role') or student.role != 'student':
            return 0
            
        attempts_count = QuizAttempt.objects.filter(
            student=student,
            quiz=obj
        ).count()
        
        return max(0, obj.max_attempts - attempts_count)


class AnswerSerializer(serializers.ModelSerializer):
    """
    Answer serializer
    """
    question_text = serializers.CharField(source='question.text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    question_points = serializers.DecimalField(source='question.points', read_only=True, max_digits=5, decimal_places=2)
    
    class Meta:
        model = Answer
        fields = [
            'id',
            'question',
            'question_text',
            'question_type',
            'question_points',
            'answer_text',
            'selected_option',
            'is_correct',
            'points_earned',
            'created_at'
        ]
        read_only_fields = ['is_correct', 'points_earned', 'created_at']
    
    def validate(self, data):
        """
        Validate answer based on question type
        """
        question = self.instance.question if self.instance else self.context.get('question')
        
        if not question:
            raise ValidationError('Question is required.')
        
        if question.question_type == Question.QuestionType.ESSAY:
            if not data.get('answer_text'):
                raise ValidationError({'answer_text': 'Answer text is required for essay questions.'})
        
        elif question.question_type in [Question.QuestionType.MULTIPLE_CHOICE, Question.QuestionType.TRUE_FALSE]:
            selected_option = data.get('selected_option')
            if not selected_option:
                raise ValidationError({'selected_option': 'Selected option is required.'})
            
            if selected_option not in question.options:
                raise ValidationError({'selected_option': 'Selected option is invalid.'})
        
        return data


class QuizAttemptSerializer(serializers.ModelSerializer):
    """
    Quiz attempt serializer
    """
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    time_remaining_seconds = serializers.SerializerMethodField()
    quiz_total_points = serializers.DecimalField(source='quiz.get_total_points', read_only=True, max_digits=8, decimal_places=2)
    
    class Meta:
        model = QuizAttempt
        ref_name = 'QuizzesQuizAttemptSerializer'
        fields = [
            'id',
            'student',
            'student_name',
            'student_email',
            'quiz',
            'quiz_title',
            'quiz_total_points',
            'attempt_number',
            'status',
            'started_at',
            'submitted_at',
            'time_taken_seconds',
            'time_remaining_seconds',
            'score',
            'passed',
            'graded_at',
            'graded_by',
            'answers'
        ]
        read_only_fields = [
            'student',
            'attempt_number',
            'submitted_at',
            'time_taken_seconds',
            'score',
            'passed',
            'graded_at',
            'graded_by'
        ]
    
    def get_time_remaining_seconds(self, obj):
        """
        Calculate remaining time for the quiz
        """
        return obj.get_time_remaining()


class QuizAttemptCreateSerializer(serializers.Serializer):
    """
    Quiz attempt creation serializer
    """
    quiz_id = serializers.IntegerField()
    
    def validate_quiz_id(self, value):
        """
        Validate quiz id
        """
        try:
            quiz = Quiz.objects.get(id=value)
        except Quiz.DoesNotExist:
            raise ValidationError('Quiz not found.')
        
        if not quiz.is_published:
            raise ValidationError('Quiz is not published.')
        
        return value


class AnswerSubmitSerializer(serializers.Serializer):
    """
    Answer submission serializer
    """
    question_id = serializers.IntegerField()
    answer_text = serializers.CharField(required=False, allow_blank=True)
    selected_option = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    def validate(self, data):
        """
        Ensure the submitted answer fits the question type
        """
        question_id = data.get('question_id')
        
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            raise ValidationError({'question_id': 'Question not found.'})
        
        if question.question_type == Question.QuestionType.ESSAY:
            if 'answer_text' not in data or not data['answer_text']:
                raise ValidationError({'answer_text': 'Answer text is required for essay questions.'})
        
        elif question.question_type in [Question.QuestionType.MULTIPLE_CHOICE, Question.QuestionType.TRUE_FALSE]:
            if 'selected_option' not in data or not data['selected_option']:
                raise ValidationError({'selected_option': 'Selected option is required.'})
            
            if data['selected_option'] not in question.options:
                raise ValidationError({'selected_option': 'Selected option is invalid.'})
        
        return data


class QuizGradeSerializer(serializers.Serializer):
    """
    Quiz grading serializer
    """
    scores = serializers.DictField(
        child=serializers.DecimalField(max_digits=5, decimal_places=2, min_value=0),
        required=True
    )
    
    def validate_scores(self, value):
        """
        Validate provided scores
        """
        for question_id, score in value.items():
            try:
                question = Question.objects.get(id=question_id)
                if question.question_type != Question.QuestionType.ESSAY:
                    raise ValidationError(f'Question {question_id} is not an essay question.')
                
                if score < Decimal('0') or score > question.points:
                    raise ValidationError(f'Score for question {question_id} must be between 0 and {question.points}.')
            except Question.DoesNotExist:
                raise ValidationError(f'Question {question_id} not found.')
        
        return value