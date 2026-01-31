"""
Django management command for updating course statistics.
"""
from django.core.management.base import BaseCommand
from payments.services import CourseStatsService
from courses.models import Course
import logging
from django.db.models import Count

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Update course statistics cache'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--course-id',
            type=int,
            help='Update specific course only'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Update all courses'
        )
        parser.add_argument(
            '--instructor-id',
            type=int,
            help='Update all courses for a specific instructor'
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed output'
        )
    
    def handle(self, *args, **options):
        course_id = options['course_id']
        update_all = options['all']
        instructor_id = options['instructor_id']
        verbose = options['verbose']
        
        updated_count = 0
        
        if course_id:
            self.stdout.write(f'Updating stats for course ID: {course_id}')
            try:
                course = Course.objects.get(id=course_id)
                stats = CourseStatsService.update_course_stats(course)
                updated_count += 1
                
                if verbose:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ {course.title}: '
                            f'{stats.total_purchases} purchases, '
                            f'{stats.total_revenue} revenue, '
                            f'{stats.active_students} students'
                        )
                    )
                else:
                    self.stdout.write(self.style.SUCCESS(f'✓ Updated: {course.title}'))
                    
            except Course.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'✗ Course {course_id} not found'))
        
        elif instructor_id:
            self.stdout.write(f'Updating stats for instructor ID: {instructor_id}')
            courses = Course.objects.filter(
                instructor_id=instructor_id,
                deleted_at__isnull=True
            )
            
            for course in courses:
                stats = CourseStatsService.update_course_stats(course)
                updated_count += 1
                
                if verbose:
                    self.stdout.write(
                        f'  ✓ {course.title}: '
                        f'{stats.total_purchases} purchases, '
                        f'{stats.total_revenue} revenue'
                    )
            
            self.stdout.write(
                self.style.SUCCESS(f'✓ Updated {updated_count} courses for instructor')
            )
        
        elif update_all:
            self.stdout.write('Updating stats for all courses...')
            CourseStatsService.update_all_stats()
            
            total_courses = Course.objects.filter(deleted_at__isnull=True).count()
            self.stdout.write(
                self.style.SUCCESS(f'✓ Updated stats for {total_courses} courses')
            )
            logger.info(f'Updated course stats for {total_courses} courses')
        
        else:
            self.stdout.write(
                self.style.WARNING(
                    'Please specify one of:\n'
                    '  --course-id <id>    Update specific course\n'
                    '  --instructor-id <id> Update all courses for instructor\n'
                    '  --all                Update all courses'
                )
            )