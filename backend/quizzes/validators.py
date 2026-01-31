"""
مدققات البيانات لتطبيق الكويزات
"""

from django.core.exceptions import ValidationError
from decimal import Decimal


def validate_passing_grade(value):
    """
    يتحقق أن درجة النجاح بين 0 و 100
    """
    if value < Decimal('0') or value > Decimal('100'):
        raise ValidationError('درجة النجاح يجب أن تكون بين 0 و 100.')


def validate_positive_points(value):
    """
    يتحقق أن درجة السؤال موجبة
    """
    if value <= Decimal('0'):
        raise ValidationError('درجة السؤال يجب أن تكون أكبر من صفر.')


def validate_max_attempts(value):
    """
    يتحقق أن عدد المحاولات موجب
    """
    if value < 1:
        raise ValidationError('عدد المحاولات يجب أن يكون على الأقل 1.')


def validate_time_limit(value):
    """
    يتحقق أن وقت الكويز موجب
    """
    if value and value < 1:
        raise ValidationError('وقت الكويز يجب أن يكون على الأقل دقيقة واحدة.')


def validate_options_count(options):
    """
    يتحقق أن عدد الخيارات للسؤال مناسب
    """
    if not options or len(options) < 2:
        raise ValidationError('السؤال يجب أن يحتوي على الأقل على خيارين.')


def validate_correct_answer_exists(question_type, correct_answer, options):
    """
    يتحقق وجود إجابة صحيحة للأسئلة الاختيارية
    """
    if question_type in ['multiple_choice', 'true_false']:
        if not correct_answer:
            raise ValidationError('السؤال يجب أن يحتوي على إجابة صحيحة.')
        
        # للأسئلة الاختيارية، يجب أن تكون الإجابة الصحيحة ضمن الخيارات
        if options and correct_answer not in options:
            raise ValidationError('الإجابة الصحيحة يجب أن تكون ضمن الخيارات المتاحة.')