"""
تطبيق الكويزات
"""

from django.apps import AppConfig


class QuizzesConfig(AppConfig):
    """
    إعدادات تطبيق الكويزات
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'quizzes'
    verbose_name = 'الكويزات'
    
    def ready(self):
        """
        تهيئة التطبيق
        """
        # استيراد الإشارات
        import quizzes.signals