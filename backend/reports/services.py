"""
Services for reports app.
"""
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal


class ReportService:
    """Service for generating reports."""
    
    @staticmethod
    def get_top_selling_courses(limit=10, period=None, instructor_id=None):
        """Get top selling courses report."""
        from payments.models import CourseStats
        
        queryset = CourseStats.objects.all()
        
        # Filter by instructor
        if instructor_id:
            queryset = queryset.filter(course__instructor_id=instructor_id)
        
        # Apply time period filter
        if period:
            start_date = None
            if period == 'today':
                start_date = timezone.now().date()
            elif period == 'week':
                start_date = timezone.now().date() - timedelta(days=7)
            elif period == 'month':
                start_date = timezone.now().date() - timedelta(days=30)
            elif period == 'year':
                start_date = timezone.now().date() - timedelta(days=365)
            
            if start_date:
                # This would need to join with Purchase model for date filtering
                # Simplified for now
                pass
        
        top_courses = queryset.order_by('-total_revenue')[:limit]

        # Normalize keys so they match serializer field names used by views
        rows = []
        for c in top_courses.values(
            'course__id',
            'course__title',
            'course__instructor__email',
            'course__instructor__first_name',
            'course__instructor__last_name',
            'course__price',
            'total_purchases',
            'total_revenue',
            'active_students',
            'last_updated'
        ):
            instructor_name = ' '.join(filter(None, [
                c.get('course__instructor__first_name'),
                c.get('course__instructor__last_name')
            ])).strip() or None

            rows.append({
                'course_id': c.get('course__id'),
                'course_title': c.get('course__title'),
                'instructor_email': c.get('course__instructor__email'),
                'instructor_name': instructor_name,
                'price': c.get('course__price'),
                'total_purchases': c.get('total_purchases'),
                'total_revenue': c.get('total_revenue'),
                'active_students': c.get('active_students'),
                'last_updated': c.get('last_updated')
            })

        return rows
    
    @staticmethod
    def get_student_activity_report(student_id=None, start_date=None, end_date=None):
        """Get student activity report."""
        from payments.models import Transaction, Purchase
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Base queryset
        if student_id:
            students = User.objects.filter(id=student_id, role='student')
        else:
            students = User.objects.filter(role='student')
        
        report_data = []
        
        for student in students:
            # Get wallet
            from payments.models import Wallet
            wallet, _ = Wallet.objects.get_or_create(student=student)
            
            # Date filtering
            date_filter = Q()
            if start_date:
                date_filter &= Q(created_at__gte=start_date)
            if end_date:
                date_filter &= Q(created_at__lte=end_date)
            
            # Transactions
            transactions = Transaction.objects.filter(
                wallet=wallet
            ).filter(date_filter)
            
            total_deposits = transactions.filter(
                transaction_type__in=['deposit', 'recharge_code', 'manual_deposit']
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            total_withdrawals = abs(transactions.filter(
                transaction_type__in=['withdrawal', 'purchase']
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00'))
            
            # Purchases
            purchases = Purchase.objects.filter(
                student=student
            ).filter(date_filter)
            
            total_purchases = purchases.count()
            total_spent = purchases.filter(refunded=False).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')
            
            total_refunds = purchases.filter(refunded=True).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')
            
            report_data.append({
                'student_id': student.id,
                'student_email': student.email,
                'student_name': student.get_full_name(),
                'wallet_balance': wallet.balance,
                'total_deposits': total_deposits,
                'total_withdrawals': total_withdrawals,
                'total_purchases': total_purchases,
                'total_spent': total_spent,
                'total_refunds': total_refunds,
                'net_spent': total_spent - total_refunds,
                'last_activity': transactions.order_by('-created_at').first().created_at 
                    if transactions.exists() else None
            })
        
        return report_data
    
    @staticmethod
    def get_recharge_code_report(start_date=None, end_date=None):
        """Get recharge code usage report."""
        from payments.models import RechargeCode
        
        queryset = RechargeCode.objects.all()
        
        # Date filtering
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        total_codes = queryset.count()
        used_codes = queryset.filter(is_used=True).count()
        unused_codes = total_codes - used_codes
        
        total_amount = queryset.filter(is_used=True).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # Usage by creator
        usage_by_creator = list(queryset.filter(is_used=True).values(
            'created_by__email'
        ).annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('-total_amount'))
        
        # Recent usage
        recent_usage = queryset.filter(
            is_used=True
        ).select_related('used_by', 'created_by').order_by('-used_at')[:20]
        
        return {
            'summary': {
                'total_codes': total_codes,
                'used_codes': used_codes,
                'unused_codes': unused_codes,
                'usage_percentage': (used_codes / total_codes * 100) if total_codes > 0 else 0,
                'total_amount': total_amount
            },
            'usage_by_creator': usage_by_creator,
            'recent_usage': list(recent_usage.values(
                'code',
                'amount',
                'used_by__email',
                'used_at',
                'created_by__email'
            ))
        }
    
    @staticmethod
    def get_refund_report(start_date=None, end_date=None):
        """Get refund report."""
        from payments.models import Purchase
        
        queryset = Purchase.objects.filter(refunded=True)
        
        # Date filtering
        if start_date:
            queryset = queryset.filter(refunded_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(refunded_at__lte=end_date)
        
        total_refunds = queryset.count()
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Refunds by course
        refunds_by_course = list(queryset.values(
            'course__id',
            'course__title',
            'course__instructor__email'
        ).annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('-total_amount'))
        
        # Refunds by student: build list with student email and best-effort name
        from django.contrib.auth import get_user_model
        User = get_user_model()

        refunds_by_student = []
        student_agg = queryset.values('student').annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('-total_amount')[:20]

        for item in student_agg:
            student_id = item.get('student')
            student = User.objects.filter(id=student_id).first()
            refunds_by_student.append({
                'student_id': student_id,
                'student_email': student.email if student else None,
                'student_name': student.get_full_name() if student else None,
                'count': item.get('count'),
                'total_amount': item.get('total_amount')
            })
        
        # Recent refunds
        recent_refunds = queryset.select_related(
            'student', 'course'
        ).order_by('-refunded_at')[:20]
        
        return {
            'summary': {
                'total_refunds': total_refunds,
                'total_amount': total_amount,
                'average_refund': total_amount / total_refunds if total_refunds > 0 else 0
            },
            'by_course': refunds_by_course,
            'by_student': refunds_by_student,
            'recent_refunds': list(recent_refunds.values(
                'id',
                'student__email',
                'course__title',
                'amount',
                'refunded_at',
                'refund_reason'
            ))
        }
    
    @staticmethod
    def get_instructor_revenue_report(instructor_id=None, start_date=None, end_date=None):
        """Get instructor revenue report."""
        from payments.services import CourseStatsService
        from courses.models import Course
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        if instructor_id:
            instructors = User.objects.filter(id=instructor_id, role='teacher')
        else:
            instructors = User.objects.filter(role='teacher')
        
        report_data = []
        
        for instructor in instructors:
            stats = CourseStatsService.get_instructor_stats(instructor)
            
            # Date filtering for detailed data
            from payments.models import Purchase
            date_filter = Q()
            if start_date:
                date_filter &= Q(purchased_at__gte=start_date)
            if end_date:
                date_filter &= Q(purchased_at__lte=end_date)
            
            # Recent sales
            recent_sales = Purchase.objects.filter(
                course__instructor=instructor,
                refunded=False
            ).filter(date_filter).order_by('-purchased_at')[:10]
            
            # Monthly revenue
            monthly_revenue = []
            today = timezone.now().date()
            
            for i in range(6):
                month_start = today.replace(day=1) - timedelta(days=30*i)
                month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                
                revenue = Purchase.objects.filter(
                    course__instructor=instructor,
                    purchased_at__date__range=[month_start, month_end],
                    refunded=False
                ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
                
                monthly_revenue.append({
                    'month': month_start.strftime('%Y-%m'),
                    'revenue': revenue
                })
            
            report_data.append({
                'instructor_id': instructor.id,
                'instructor_email': instructor.email,
                'instructor_name': instructor.get_full_name(),
                'total_courses': stats['total_courses'],
                'total_purchases': stats['total_purchases'],
                'total_revenue': stats['total_revenue'],
                'total_students': stats['total_students'],
                'courses': stats['courses'],
                'recent_sales': list(recent_sales.values(
                    'id',
                    'student__email',
                    'course__title',
                    'amount',
                    'purchased_at'
                )),
                'monthly_revenue': monthly_revenue
            })
        
        return report_data
    
    @staticmethod
    def get_failed_transactions_report(start_date=None, end_date=None):
        """Get failed transactions report."""
        from payments.models import PaymentLog
        
        queryset = PaymentLog.objects.filter(
            Q(action='suspicious_recharge_attempts') |
            Q(action='suspicious_purchase_rate')
        )
        
        # Date filtering
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        total_failed = queryset.count()
        
        # By action type
        by_action = list(queryset.values('action').annotate(
            count=Count('id')
        ).order_by('-count'))
        
        # By IP address
        by_ip = list(queryset.exclude(ip_address=None).values('ip_address').annotate(
            count=Count('id')
        ).order_by('-count')[:10])
        
        # Recent failed transactions
        recent_failed = queryset.select_related(
            'actor', 'student'
        ).order_by('-created_at')[:20]
        
        return {
            'summary': {
                'total_failed': total_failed,
                'by_action': by_action
            },
            'by_ip': by_ip,
            'recent_failed': list(recent_failed.values(
                'id',
                'action',
                'actor__email',
                'student__email',
                'ip_address',
                'created_at',
                'metadata'
            ))
        }