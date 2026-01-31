"""
Services for dashboard app.
"""
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal


class DashboardService:
    """Service for dashboard data."""
    
    @staticmethod
    def get_admin_dashboard(start_date=None, end_date=None):
        """Get data for admin dashboard."""
        from payments.models import Transaction, Purchase, RechargeCode, PaymentLog
        from courses.models import Course
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Date filtering
        date_filter = Q()
        purchase_date_filter = Q()
        if start_date:
            date_filter &= Q(created_at__gte=start_date)
            purchase_date_filter &= Q(purchased_at__gte=start_date)
        if end_date:
            date_filter &= Q(created_at__lte=end_date)
            purchase_date_filter &= Q(purchased_at__lte=end_date)
        
        # Total statistics
        total_revenue = Purchase.objects.filter(
            refunded=False
        ).filter(purchase_date_filter).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        total_purchases = Purchase.objects.filter(
            refunded=False
        ).filter(purchase_date_filter).count()
        
        total_students = User.objects.filter(role='student').count()
        total_courses = Course.objects.filter(deleted_at__isnull=True).count()
        total_instructors = User.objects.filter(role='teacher').count()
        
        # Today's statistics
        today = timezone.now().date()
        today_revenue = Purchase.objects.filter(
            purchased_at__date=today,
            refunded=False
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        today_purchases = Purchase.objects.filter(
            purchased_at__date=today,
            refunded=False
        ).count()
        
        today_recharges = Transaction.objects.filter(
            created_at__date=today,
            transaction_type=Transaction.TransactionType.RECHARGE_CODE
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Weekly data (last 7 days)
        weekly_data = []
        for i in range(7):
            date = today - timedelta(days=i)
            revenue = Purchase.objects.filter(
                purchased_at__date=date,
                refunded=False
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            purchases = Purchase.objects.filter(
                purchased_at__date=date,
                refunded=False
            ).count()
            
            weekly_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'day_name': date.strftime('%a'),
                'revenue': revenue,
                'purchases': purchases
            })
        
        # Monthly data (last 6 months)
        monthly_data = []
        for i in range(6):
            month_start = today.replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            revenue = Purchase.objects.filter(
                purchased_at__date__range=[month_start, month_end],
                refunded=False
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            purchases = Purchase.objects.filter(
                purchased_at__date__range=[month_start, month_end],
                refunded=False
            ).count()
            
            monthly_data.append({
                'month': month_start.strftime('%Y-%m'),
                'month_name': month_start.strftime('%b %Y'),
                'revenue': revenue,
                'purchases': purchases
            })
        
        # Top courses (by revenue)
        from payments.models import CourseStats
        top_courses = CourseStats.objects.order_by('-total_revenue')[:10].values(
            'course__id',
            'course__title',
            'course__instructor__email',
            'course__instructor__teacher_admin_profile__first_name',
            'course__instructor__teacher_admin_profile__last_name',
            'total_purchases',
            'total_revenue',
            'active_students'
        )
        
        # Recent transactions
        recent_transactions = Transaction.objects.filter(date_filter).select_related(
            'wallet__student', 'created_by', 'purchase__course'
        ).order_by('-created_at')[:10]
        
        # Failed/suspicious activities
        suspicious_activities = PaymentLog.objects.filter(
            Q(action='suspicious_recharge_attempts') |
            Q(action='suspicious_purchase_rate')
        ).filter(date_filter).order_by('-created_at')[:5]
        
        # Recharge code statistics
        recharge_stats = {
            'total_codes': RechargeCode.objects.count(),
            'used_codes': RechargeCode.objects.filter(is_used=True).count(),
            'unused_codes': RechargeCode.objects.filter(is_used=False).count(),
            'total_amount_used': RechargeCode.objects.filter(is_used=True).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00'),
            'expired_codes': RechargeCode.objects.filter(
                expires_at__lt=timezone.now(),
                is_used=False
            ).count()
        }
        
        # User statistics
        user_stats = {
            'total_users': User.objects.count(),
            'active_today': User.objects.filter(
                last_login__date=today
            ).count(),
            'new_this_month': User.objects.filter(
                date_joined__month=today.month,
                date_joined__year=today.year
            ).count(),
            'by_role': list(User.objects.values('role').annotate(
                count=Count('id')
            ))
        }
        
        return {
            'overview': {
                'total_revenue': total_revenue,
                'total_purchases': total_purchases,
                'total_students': total_students,
                'total_courses': total_courses,
                'total_instructors': total_instructors
            },
            'today': {
                'revenue': today_revenue,
                'purchases': today_purchases,
                'recharges': today_recharges,
                'active_users': user_stats['active_today']
            },
            'weekly_data': weekly_data,
            'monthly_data': monthly_data,
            'top_courses': list(top_courses),
            'user_stats': user_stats,
            'recharge_stats': recharge_stats,
            'suspicious_activities': list(suspicious_activities.values(
                'id', 'action', 'student__email', 'ip_address', 'created_at'
            ))
        }
    
    @staticmethod
    def get_teacher_dashboard(teacher, start_date=None, end_date=None):
        """Get data for teacher dashboard."""
        from payments.services import CourseStatsService
        from courses.models import Course
        from payments.models import Purchase
        
        # Get course statistics
        stats = CourseStatsService.get_instructor_stats(teacher)
        
        # Date filtering
        date_filter = Q()
        if start_date:
            date_filter &= Q(purchased_at__gte=start_date)
        if end_date:
            date_filter &= Q(purchased_at__lte=end_date)
        
        # Recent purchases
        recent_purchases = Purchase.objects.filter(
            course__instructor=teacher,
            refunded=False
        ).filter(date_filter).select_related(
            'student', 'course'
        ).order_by('-purchased_at')[:10]
        
        # Monthly revenue (last 6 months)
        monthly_revenue = []
        today = timezone.now().date()
        
        for i in range(6):
            month_start = today.replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            revenue = Purchase.objects.filter(
                course__instructor=teacher,
                purchased_at__date__range=[month_start, month_end],
                refunded=False
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            purchases = Purchase.objects.filter(
                course__instructor=teacher,
                purchased_at__date__range=[month_start, month_end],
                refunded=False
            ).count()
            
            monthly_revenue.append({
                'month': month_start.strftime('%Y-%m'),
                'month_name': month_start.strftime('%b %Y'),
                'revenue': revenue,
                'purchases': purchases
            })
        
        # Student demographics
        student_stats = {
            'total_students': stats['total_students'],
            'new_this_month': Purchase.objects.filter(
                course__instructor=teacher,
                purchased_at__month=today.month,
                purchased_at__year=today.year,
                refunded=False
            ).values('student').distinct().count(),
            'repeat_students': 0,  # Students who bought more than one course
        }
        
        # Calculate repeat students
        student_purchase_counts = Purchase.objects.filter(
            course__instructor=teacher,
            refunded=False
        ).values('student').annotate(
            purchase_count=Count('id')
        )
        
        student_stats['repeat_students'] = sum(
            1 for item in student_purchase_counts 
            if item['purchase_count'] > 1
        )
        
        # Course performance
        course_performance = []
        for course in Course.objects.filter(instructor=teacher, deleted_at__isnull=True):
            course_purchases = Purchase.objects.filter(
                course=course,
                refunded=False
            ).filter(date_filter)
            
            revenue = course_purchases.aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')
            
            students = course_purchases.values('student').distinct().count()
            
            course_performance.append({
                'course_id': course.id,
                'course_title': course.title,
                'price': course.price,
                'purchases': course_purchases.count(),
                'revenue': revenue,
                'students': students,
                'completion_rate': 0  # Would need enrollment data
            })
        
        return {
            'overview': {
                'total_courses': stats['total_courses'],
                'total_purchases': stats['total_purchases'],
                'total_revenue': stats['total_revenue'],
                'total_students': stats['total_students'],
                'average_per_course': stats['total_revenue'] / stats['total_courses'] 
                    if stats['total_courses'] > 0 else Decimal('0.00')
            },
            'student_stats': student_stats,
            'course_performance': course_performance,
            'monthly_revenue': monthly_revenue,
            'recent_purchases': list(recent_purchases.values(
                'id',
                'student__email',
                'student__student_profile__first_name',
                'student__student_profile__last_name',
                'course__title',
                'amount',
                'purchased_at'
            ))
        }
    
    @staticmethod
    def get_student_dashboard(student, start_date=None, end_date=None):
        """Get data for student dashboard."""
        from payments.models import Wallet, Transaction, Purchase
        
        # Get wallet
        wallet, _ = Wallet.objects.get_or_create(student=student)
        
        # Date filtering
        date_filter = Q()
        if start_date:
            date_filter &= Q(created_at__gte=start_date)
        if end_date:
            date_filter &= Q(created_at__lte=end_date)
        
        purchase_date_filter = Q()
        if start_date:
            purchase_date_filter &= Q(purchased_at__gte=start_date)
        if end_date:
            purchase_date_filter &= Q(purchased_at__lte=end_date)
        
        # Recent transactions
        recent_transactions = Transaction.objects.filter(
            wallet=wallet
        ).filter(date_filter).select_related(
            'purchase__course', 'recharge_code'
        ).order_by('-created_at')[:10]
        
        # Recent purchases
        recent_purchases = Purchase.objects.filter(
            student=student
        ).filter(purchase_date_filter).select_related(
            'course'
        ).order_by('-purchased_at')[:10]
        
        # Spending statistics
        total_spent = Purchase.objects.filter(
            student=student,
            refunded=False
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        total_refunded = Purchase.objects.filter(
            student=student,
            refunded=True
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        total_deposits = Transaction.objects.filter(
            wallet=wallet,
            transaction_type__in=[
                Transaction.TransactionType.DEPOSIT,
                Transaction.TransactionType.RECHARGE_CODE,
                Transaction.TransactionType.MANUAL_DEPOSIT,
                Transaction.TransactionType.REFUND
            ]
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Monthly spending (last 6 months)
        monthly_spending = []
        today = timezone.now().date()
        
        for i in range(6):
            month_start = today.replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            spent = Purchase.objects.filter(
                student=student,
                purchased_at__date__range=[month_start, month_end],
                refunded=False
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            deposits = Transaction.objects.filter(
                wallet=wallet,
                created_at__date__range=[month_start, month_end],
                transaction_type__in=[
                    Transaction.TransactionType.DEPOSIT,
                    Transaction.TransactionType.RECHARGE_CODE,
                    Transaction.TransactionType.MANUAL_DEPOSIT,
                    Transaction.TransactionType.REFUND
                ]
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            monthly_spending.append({
                'month': month_start.strftime('%Y-%m'),
                'month_name': month_start.strftime('%b %Y'),
                'spent': spent,
                'deposits': deposits,
                'net': deposits - spent
            })
        
        # Course progress (if enrollment data available)
        course_progress = []
        from courses.models import Enrollment
        enrollments = Enrollment.objects.filter(
            student=student
        ).select_related('course')
        
        for enrollment in enrollments:
            course_progress.append({
                'course_id': enrollment.course.id,
                'course_title': enrollment.course.title,
                'progress': enrollment.progress_percentage,
                'enrolled_at': enrollment.enrolled_at,
                'completed_at': enrollment.completed_at
            })
        
        # Transaction summary
        transaction_summary = {
            'total_count': Transaction.objects.filter(wallet=wallet).count(),
            'by_type': list(Transaction.objects.filter(
                wallet=wallet
            ).values('transaction_type').annotate(
                count=Count('id'),
                total=Sum('amount')
            )),
            'last_activity': Transaction.objects.filter(
                wallet=wallet
            ).order_by('-created_at').first().created_at 
                if Transaction.objects.filter(wallet=wallet).exists() else None
        }
        
        return {
            'wallet': {
                'balance': wallet.balance,
                'created_at': wallet.created_at,
                'updated_at': wallet.updated_at
            },
            'spending': {
                'total_spent': total_spent,
                'total_refunded': total_refunded,
                'total_deposits': total_deposits,
                'net_spent': total_spent - total_refunded,
                'current_balance': wallet.balance
            },
            'transaction_summary': transaction_summary,
            'course_progress': course_progress,
            'monthly_spending': monthly_spending,
            'recent_transactions': list(recent_transactions.values(
                'id',
                'transaction_type',
                'payment_method',
                'amount',
                'description',
                'purchase__course__title',
                'recharge_code__code',
                'created_at'
            )),
            'recent_purchases': list(recent_purchases.values(
                'id',
                'course__title',
                'amount',
                'price_at_purchase',
                'purchased_at',
                'refunded'
            ))
        }
    
    @staticmethod
    def get_filter_options(user):
        """Get available filter options based on user role."""
        from django.contrib.auth import get_user_model
        from courses.models import Course
        
        User = get_user_model()
        
        options = {}
        
        if user.role == 'admin':
            # Admin filter options
            options['instructors'] = list(User.objects.filter(
                role='teacher'
            ).values('id', 'email', 'teacher_admin_profile__first_name', 'teacher_admin_profile__last_name'))
            
            options['courses'] = list(Course.objects.filter(
                deleted_at__isnull=True
            ).values('id', 'title', 'instructor__email'))
            
            options['students'] = list(User.objects.filter(
                role='student'
            ).values('id', 'email', 'student_profile__first_name', 'student_profile__last_name'))
            
            options['date_ranges'] = [
                {'value': 'today', 'label': 'Today'},
                {'value': 'yesterday', 'label': 'Yesterday'},
                {'value': 'week', 'label': 'Last 7 Days'},
                {'value': 'month', 'label': 'Last 30 Days'},
                {'value': 'quarter', 'label': 'Last 90 Days'},
                {'value': 'year', 'label': 'Last 365 Days'},
            ]
        
        elif user.role == 'teacher':
            # Teacher filter options
            options['my_courses'] = list(Course.objects.filter(
                instructor=user,
                deleted_at__isnull=True
            ).values('id', 'title'))
            
            options['date_ranges'] = [
                {'value': 'today', 'label': 'Today'},
                {'value': 'week', 'label': 'Last 7 Days'},
                {'value': 'month', 'label': 'Last 30 Days'},
                {'value': 'quarter', 'label': 'Last 90 Days'},
            ]
        
        elif user.role == 'student':
            # Student filter options
            options['date_ranges'] = [
                {'value': 'today', 'label': 'Today'},
                {'value': 'week', 'label': 'Last 7 Days'},
                {'value': 'month', 'label': 'Last 30 Days'},
            ]
        
        return options