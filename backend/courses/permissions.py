"""
Permissions for courses app.
"""
from rest_framework import permissions
from django.core.cache import cache
import logging

from users.permissions import IsAdminUser, IsTeacherUser, IsStudentUser

logger = logging.getLogger(__name__)


class IsCourseInstructorOrAdmin(permissions.BasePermission):
    """Permission to check if user is course instructor or admin."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if hasattr(obj, 'instructor'):
            return obj.instructor == request.user
        if hasattr(obj, 'course') and hasattr(obj.course, 'instructor'):
            return obj.course.instructor == request.user
        return False


class CanAccessCourse(permissions.BasePermission):
    """Permission to access course content."""
    
    def has_object_permission(self, request, view, obj):
        # Get the action from view
        action = getattr(view, 'action', None)
        
        # Admins and instructors can always access
        if request.user.role in ['admin', 'teacher']:
            if hasattr(obj, 'instructor') and obj.instructor == request.user:
                return True
            if request.user.role == 'admin':
                return True
        
        # For students: check based on action type
        if request.user.role == 'student':
            from .models import Enrollment
            from payments.models import Purchase
            
            # Get course object
            if hasattr(obj, 'price'):  # obj is a Course
                course = obj
            elif hasattr(obj, 'course'):  # obj is related to a course
                course = obj.course
            else:
                return False
            
            # Allow viewing basic course info BEFORE purchase (for browsing)
            if action in ['retrieve', 'list']:  # Viewing course details/list
                return True  # Allow all authenticated users to see basic info
            
            # Check enrollment and purchase for full content access
            is_enrolled = Enrollment.objects.filter(
                student=request.user,
                course=course
            ).exists()
            
            is_purchased = Purchase.objects.filter(
                student=request.user,
                course=course,
                refunded=False
            ).exists()
            
            # For other actions (content, lectures, etc.) require purchase
            return is_enrolled and (is_purchased or course.price == 0)
        
        return False


class IsEnrolledStudent(permissions.BasePermission):
    """
    ???? ?????? ??????? ??? ??? ?????? ??????
    ???? ???????? ??????? ??????? ??? ????
    """
    
    def has_permission(self, request, view):
        # ??? ?? ???? ???? ????
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get the action from view
        action = getattr(view, 'action', None)
        
        # ???????? ??????? - ?????? ??????? ??????
        if getattr(request.user, 'role', None) in ['teacher', 'admin']:
            return True
        
        # ??????: ?????? ???? ????????? ???????? ????????
        if action in ['retrieve', 'list']:
            return True
        
        # ?????? ?? ??????? ???? (?????? ???????): ?????? ?? ??????
        return True  # ???? ?????? ?? has_object_permission

    def has_object_permission(self, request, view, obj):
        # Get the action from view
        action = getattr(view, 'action', None)
        
        # ???????? ??????? ????? ??? ???
        if getattr(request.user, 'role', None) in ['teacher', 'admin']:
            return True

        # ??? ??? ????
        if getattr(request.user, 'role', None) == 'student':
            course = self._get_course_from_object(obj)
            if not course:
                return False
            
            # ?????? ???? ??????? ?????? ???????? ??? ??????
            if action in ['retrieve', 'list']:
                return True
            
            # ?????? ??????? ?????? (???????? ?????): ?????? ?? ??????
            cache_key = f"purchase:{request.user.id}:{course.id}"
            cached = cache.get(cache_key)
            if cached is not None:
                allowed = cached
            else:
                # ??????? ???? ????? ????????? ???????
                from payments.models import Purchase
                allowed = Purchase.objects.filter(
                    student=request.user,
                    course=course,
                    refunded=False
                ).exists() or course.price == 0
                
                # ????? ???? ???? ????? ?????? ????? ??? ????? ????????
                cache.set(cache_key, allowed, 60)
            
            if not allowed:
                logger.warning(
                    "Enrolled check failed: user=%s course=%s view=%s action=%s",
                    getattr(request.user, 'id', None),
                    getattr(course, 'id', None),
                    view.__class__.__name__,
                    action
                )
            
            return allowed

        return False

    def _get_course_from_object(self, obj):
        # ??? ??? object ?? ????
        from .models import Course

        if obj is None:
            return None

        # If obj has direct course attr (Lesson, Material, Quiz, LectureFile)
        if hasattr(obj, 'course'):
            return getattr(obj, 'course')

        # If obj is a Lecture (has section -> course)
        if hasattr(obj, 'section') and hasattr(obj.section, 'course'):
            return obj.section.course

        # If obj is a LectureFile with lecture -> section -> course
        if hasattr(obj, 'lecture') and hasattr(obj.lecture, 'section') and hasattr(obj.lecture.section, 'course'):
            return obj.lecture.section.course

        # If object itself is a Course instance
        if isinstance(obj, Course):
            return obj

        return None


class HasPurchasedCourse(permissions.BasePermission):
    """
    ???? ??????? ???:
    - ???????? admin/teacher (?? ????)
    - ???????? student ????? ?????? ??? ??????
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get the action from view
        action = getattr(view, 'action', None)
        
        # ???????? ??????? ????? ??? ???
        if getattr(request.user, 'role', None) in ['teacher', 'admin']:
            return True
        
        # ??????: ?????? ???? ???????? (????????? ????????)
        if action in ['retrieve', 'list']:
            return True
        
        # ?????? ?? ??????? ????: ?????? ?? ??????
        course_id = self._get_course_id_from_view(view, request)
        if not course_id:
            return False
        
        return self._has_purchased_course(request.user, course_id)

    def has_object_permission(self, request, view, obj):
        # Get the action from view
        action = getattr(view, 'action', None)
        
        # ???????? ??????? ????? ??? ???
        if getattr(request.user, 'role', None) in ['teacher', 'admin']:
            return True
        
        # ?????? ???? ????????? ???????? ????????
        if action in ['retrieve', 'list']:
            return True
        
        # ??????: ?????? ?? ?????? ?????? ??????
        course = self._get_course_from_object(obj)
        if not course:
            return False
        
        return self._has_purchased_course(request.user, course.id)

    def _get_course_id_from_view(self, view, request):
        # try common kwargs
        kwargs = getattr(view, 'kwargs', {}) or {}
        potential_keys = ['course_id', 'course', 'pk', 'id', 'lecture_id', 'section_id', 'quiz_id', 'lesson_id', 'material_id']
        for k in potential_keys:
            val = kwargs.get(k) or request.query_params.get(k) or request.data.get(k) if hasattr(request, 'data') else None
            if val:
                # if the key is a composite resource (e.g., lecture_id), resolve to course
                if k in ['lecture_id', 'lesson_id']:
                    from .models import Lecture
                    try:
                        lec = Lecture.objects.select_related('section__course').get(pk=val)
                        return getattr(lec.section.course, 'id', None)
                    except Lecture.DoesNotExist:
                        return None
                if k == 'section_id':
                    from .models import Section
                    try:
                        sec = Section.objects.select_related('course').get(pk=val)
                        return getattr(sec.course, 'id', None)
                    except Section.DoesNotExist:
                        return None
                if k == 'quiz_id':
                    from .models import Quiz
                    try:
                        q = Quiz.objects.select_related('lecture__section__course').get(pk=val)
                        return getattr(q.lecture.section.course, 'id', None)
                    except Quiz.DoesNotExist:
                        return None
                # direct course id
                try:
                    return int(val)
                except Exception:
                    return None

        # fallback: if view has .get_object, try to get object and resolve
        try:
            obj = view.get_object()
            # reuse IsEnrolledStudent helper
            isc = IsEnrolledStudent()
            course = isc._get_course_from_object(obj)
            if course:
                return getattr(course, 'id', None)
        except Exception:
            pass

        return None
    
    def _get_course_from_object(self, obj):
        """Helper method to get course from object"""
        if obj is None:
            return None
        
        from .models import Course
        
        # If obj has direct course attr
        if hasattr(obj, 'course'):
            return getattr(obj, 'course')
        
        # If obj is a Lecture (has section -> course)
        if hasattr(obj, 'section') and hasattr(obj.section, 'course'):
            return obj.section.course
        
        # If object itself is a Course instance
        if isinstance(obj, Course):
            return obj
        
        return None

    def _has_purchased_course(self, user, course_id):
        cache_key = f"purchase:{user.id}:{course_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        
        from payments.models import Purchase
        from courses.models import Course
        
        try:
            course = Course.objects.get(id=course_id)
            # ???????? ???????? ????? ??????
            if course.price == 0:
                cache.set(cache_key, True, 60)
                return True
        except Course.DoesNotExist:
            pass
        
        allowed = Purchase.objects.filter(student=user, course_id=course_id, refunded=False).exists()
        cache.set(cache_key, allowed, 60)

        if not allowed:
            logger.warning("Purchase check failed: user=%s course_id=%s", getattr(user, 'id', None), course_id)

        return allowed


class CourseContentAccessPermission(permissions.BasePermission):
    """
    ?????? ???? ?????? ?????? ??????:
    - ???? ?????? ????? ??????? ?????? ????????
    - ???? ??? ?????? ???????? ????????? ????? ??????? ??????
    """
    
    def has_permission(self, request, view):
        # ??? ?? ???? ???? ????
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Get the action from view
        action = getattr(view, 'action', None)
        
        # ???????? ??????? ????? ??? ???
        if request.user.role in ['admin', 'teacher']:
            return True
        
        # ??????
        if request.user.role == 'student':
            from .models import Course
            from payments.models import Purchase
            
            # ?????? ??? ?????? ?? ??? object
            if isinstance(obj, Course):
                course = obj
            elif hasattr(obj, 'course'):
                course = obj.course
            elif hasattr(obj, 'section') and hasattr(obj.section, 'course'):
                course = obj.section.course
            else:
                return False
            
            # ?????? ???? ??????? ?????? ????????
            if action in ['retrieve', 'list']:  # ??? ?????? ??????
                return True
            
            # ?????? ??????? ??????: ?????? ?? ??????
            is_purchased = Purchase.objects.filter(
                student=request.user,
                course=course,
                refunded=False
            ).exists()
            
            return is_purchased or course.price == 0
        
        return False