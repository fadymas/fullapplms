"""
Views for payments app.
Updated with new models, reports, and enhanced functionality.
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
import json
from decimal import Decimal
from collections.abc import Mapping, Iterable
from django.core.exceptions import ValidationError

from users.permissions import IsAdminUser, IsStudentUser, IsTeacherUser
from .models import (
    Wallet, Transaction, Purchase, RechargeCode,
    CourseStats, PriceHistory, PaymentLog
)
from .serializers import (
    WalletSerializer, TransactionSerializer,
    PurchaseSerializer, RechargeCodeSerializer,
    BulkRechargeCodeSerializer, ManualDepositSerializer,
    UseRechargeCodeSerializer, PurchaseCourseSerializer, RefundPurchaseSerializer,
    CourseStatsSerializer, PriceHistorySerializer,
    PaymentLogSerializer, InstructorRevenueSerializer,
    StudentActivitySerializer, TopCoursesSerializer,
    RechargeCodeReportSerializer, RefundReportSerializer,
    FailedTransactionsReportSerializer, DashboardStatsSerializer
)
from .services import (
    PaymentService, BulkRechargeService,
    CourseStatsService, PriceHistoryService,
    BackupService, SuspiciousActivityService
)
from .permissions import IsCourseInstructor, IsStudentOwner


from utils.safe_serialize import convert_decimals as decimal_to_string


class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for wallet management."""
    queryset = Wallet.objects.all().select_related('student')
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'student':
            queryset = queryset.filter(student=user)
        elif user.role == 'teacher':
            # Teachers can see wallets of students enrolled in their courses
            from courses.models import Enrollment
            student_ids = Enrollment.objects.filter(
                course__instructor=user
            ).values_list('student_id', flat=True).distinct()
            queryset = queryset.filter(student_id__in=student_ids)
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(student__email__icontains=search) |
                Q(student__student_profile__full_name__icontains=search) |
                Q(student__student_profile__phone__icontains=search)
            )
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def my_wallet(self, request):
        """Get current user's wallet."""
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students have wallets'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        wallet, _ = PaymentService.create_wallet(request.user)
        serializer = self.get_serializer(wallet)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def manual_deposit(self, request, pk=None):
        """Manual deposit by admin."""
        wallet = self.get_object()
        
        serializer = ManualDepositSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            trans = PaymentService.manual_deposit(
                student=wallet.student,
                amount=serializer.validated_data['amount'],
                reason=serializer.validated_data['reason'],
                admin=request.user,
                request=request
            )
            transaction_serializer = TransactionSerializer(trans)
            return Response(transaction_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Get transactions for a wallet."""
        wallet = self.get_object()
        
        # Check permissions
        if (request.user.role == 'student' and wallet.student != request.user):
            return Response(
                {'error': 'You can only view your own wallet transactions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        transactions = wallet.transactions.all().select_related(
            'purchase__course', 'recharge_code'
        )
        
        # Apply filters
        transaction_type = request.query_params.get('type')
        if transaction_type:
            transactions = transactions.filter(transaction_type=transaction_type)
        
        start_date = request.query_params.get('start_date')
        if start_date:
            transactions = transactions.filter(created_at__gte=start_date)
        
        end_date = request.query_params.get('end_date')
        if end_date:
            transactions = transactions.filter(created_at__lte=end_date)
        
        page = self.paginate_queryset(transactions)
        if page is not None:
            serializer = TransactionSerializer(page, many=True)
            resp = self.get_paginated_response(serializer.data)
            return resp
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for transaction history."""
    queryset = Transaction.objects.all().select_related(
        'wallet__student', 'created_by',
        'purchase__course', 'recharge_code'
    )
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'student':
            queryset = queryset.filter(wallet__student=user)
        elif user.role == 'teacher':
            # Teachers can see transactions for their courses
            from courses.models import Course
            teacher_courses = Course.objects.filter(instructor=user)
            queryset = queryset.filter(
                Q(purchase__course__in=teacher_courses) |
                Q(transaction_type=Transaction.TransactionType.PURCHASE,
                  purchase__course__in=teacher_courses)
            )
        
        # Apply filters
        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        payment_method = self.request.query_params.get('payment_method')
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        student_email = self.request.query_params.get('student_email')
        if student_email and user.role in ['admin', 'teacher']:
            queryset = queryset.filter(wallet__student__email__icontains=student_email)
        
        # Search filter
        search = self.request.query_params.get('search')
        if search and user.role in ['admin', 'teacher']:
            queryset = queryset.filter(
                Q(wallet__student__email__icontains=search) |
                Q(wallet__student__student_profile__full_name__icontains=search) |
                Q(wallet__student__student_profile__phone__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get transaction summary."""
        queryset = self.filter_queryset(self.get_queryset())
        
        summary = {
            'total_count': queryset.count(),
            'total_amount': queryset.aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00'),
            'by_type': list(queryset.values('transaction_type').annotate(
                count=Count('id'),
                total=Sum('amount')
            )),
            'by_payment_method': list(queryset.values('payment_method').annotate(
                count=Count('id'),
                total=Sum('amount')
            )),
        }
        
        # Convert decimals in summary
        summary = decimal_to_string(summary)
        return Response(summary)


class PurchaseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for purchase management."""
    queryset = Purchase.objects.all().select_related('student', 'course', 'transaction')
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'student':
            queryset = queryset.filter(student=user)
        elif user.role == 'teacher':
            queryset = queryset.filter(course__instructor=user)
        
        # Apply filters
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        student_id = self.request.query_params.get('student_id')
        if student_id and user.role in ['admin', 'teacher']:
            queryset = queryset.filter(student_id=student_id)
        
        refunded = self.request.query_params.get('refunded')
        if refunded:
            queryset = queryset.filter(refunded=refunded.lower() == 'true')
        
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(purchased_at__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(purchased_at__lte=end_date)
        
        # Search filter
        search = self.request.query_params.get('search')
        if search and user.role in ['admin', 'teacher']:
            queryset = queryset.filter(
                Q(student__email__icontains=search) |
                Q(student__student_profile__full_name__icontains=search) |
                Q(student__student_profile__phone__icontains=search)
            )
        
        return queryset

    @action(detail=False, methods=['post'], permission_classes=[IsStudentUser])
    def purchase_course(self, request):
        """Purchase a course."""
        from courses.models import Course
        serializer = PurchaseCourseSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        course_id = serializer.validated_data['course_id']
        course = get_object_or_404(Course, pk=course_id)

        try:
            # Check for suspicious activity first
            SuspiciousActivityService.check_multiple_purchases(request.user, request)

            # Purchase the course
            purchase = PaymentService.purchase_course(request.user, course, request)
            # Refresh the purchase object to ensure related fields are populated
            purchase.refresh_from_db()
            # Serialize the Purchase instance using DRF serializer to ensure
            # Decimal fields are represented safely (as strings) and nested
            # related fields are handled properly.
            output_serializer = PurchaseSerializer(purchase)
            # Fallback: ensure no Decimal remains in serializer output
            response_data = decimal_to_string(output_serializer.data)
            return Response(response_data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Purchase error: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def refund(self, request, pk=None):
        """Refund a purchase (admin only)."""
        purchase = self.get_object()
        
        serializer = RefundPurchaseSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            trans = PaymentService.refund_purchase(
                purchase.student,
                purchase.course,
                serializer.validated_data.get('reason', ''),
                request.user,
                request
            )
            transaction_serializer = TransactionSerializer(trans)
            
            # Convert to dict and handle Decimals
            data = dict(transaction_serializer.data)
            for key, value in data.items():
                if isinstance(value, Decimal):
                    data[key] = str(value)
            
            return Response(data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get purchase statistics."""
        queryset = self.filter_queryset(self.get_queryset())
        
        stats = {
            'total_purchases': queryset.count(),
            'total_amount': queryset.aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00'),
            'refunded_count': queryset.filter(refunded=True).count(),
            'refunded_amount': queryset.filter(refunded=True).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00'),
            'by_course': list(queryset.values(
                'course__id', 'course__title'
            ).annotate(
                count=Count('id'),
                total=Sum('amount')
            ).order_by('-total')),
            'by_student': list(queryset.values(
                'student__id', 'student__email'
            ).annotate(
                count=Count('id'),
                total=Sum('amount')
            ).order_by('-total')[:10]),
        }
        
        # Convert ALL Decimals in stats using shared helper
        stats = decimal_to_string(stats)
        return Response(stats)


class RechargeCodeViewSet(viewsets.ModelViewSet):
    """ViewSet for recharge code management."""
    queryset = RechargeCode.objects.all()
    serializer_class = RechargeCodeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'student':
            queryset = queryset.filter(used_by=user)
        elif user.role == 'teacher':
            # Teachers can't see recharge codes
            queryset = queryset.none()
        
        # Apply filters
        is_used = self.request.query_params.get('is_used')
        if is_used:
            queryset = queryset.filter(is_used=is_used.lower() == 'true')
        
        created_by = self.request.query_params.get('created_by')
        if created_by and user.role == 'admin':
            queryset = queryset.filter(created_by__email__icontains=created_by)
        
        used_by = self.request.query_params.get('used_by')
        if used_by and user.role == 'admin':
            queryset = queryset.filter(used_by__email__icontains=used_by)
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['post'], permission_classes=[IsStudentUser])
    def use_code(self, request):
        """Use a recharge code."""
        serializer = UseRechargeCodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            trans = PaymentService.use_recharge_code(
                request.user, 
                serializer.validated_data['code'], 
                request
            )
            transaction_serializer = TransactionSerializer(trans)
            return Response(transaction_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def bulk_generate(self, request):
        """Generate recharge codes in bulk."""
        serializer = BulkRechargeCodeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            codes = BulkRechargeService.generate_codes(
                amount=serializer.validated_data['amount'],
                count=serializer.validated_data['count'],
                prefix=serializer.validated_data.get('prefix', ''),
                expires_at=serializer.validated_data.get('expires_at'),
                created_by=request.user
            )
            
            return Response(
                {
                    'message': 'Recharge codes generated successfully',
                    'count': len(codes)
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def stats(self, request):
        """Get recharge code statistics."""
        total_codes = RechargeCode.objects.count()
        used_codes = RechargeCode.objects.filter(is_used=True).count()
        unused_codes = total_codes - used_codes
        
        total_amount = RechargeCode.objects.filter(is_used=True).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        recent_usage = RechargeCode.objects.filter(
            is_used=True,
            used_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        stats = {
            'total_codes': total_codes,
            'used_codes': used_codes,
            'unused_codes': unused_codes,
            'total_amount_used': total_amount,
            'recent_usage_30_days': recent_usage,
            'usage_percentage': (used_codes / total_codes * 100) if total_codes > 0 else 0
        }
        
        stats = decimal_to_string(stats)
        return Response(stats)


# ==================== NEW VIEWSETS ====================

class CourseStatsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for course statistics."""
    queryset = CourseStats.objects.all().select_related('course__instructor')
    serializer_class = CourseStatsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'student':
            # Students can't see course stats
            queryset = queryset.none()
        elif user.role == 'teacher':
            queryset = queryset.filter(course__instructor=user)
        
        # Apply filters
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        instructor_id = self.request.query_params.get('instructor_id')
        if instructor_id and user.role == 'admin':
            queryset = queryset.filter(course__instructor_id=instructor_id)
        
        min_purchases = self.request.query_params.get('min_purchases')
        if min_purchases:
            queryset = queryset.filter(total_purchases__gte=min_purchases)
        
        return queryset
    
    @action(detail=False, methods=['get'], permission_classes=[IsTeacherUser])
    def my_courses(self, request):
        """Get statistics for teacher's own courses."""
        stats = CourseStatsService.get_instructor_stats(request.user)
        
        # Prepare data for serializer
        instructor_data = {
            'instructor_id': request.user.id,
            'instructor_email': request.user.email,
            'instructor_name': request.user.get_full_name(),
            'total_courses': stats['total_courses'],
            'total_purchases': stats['total_purchases'],
            'total_revenue': stats['total_revenue'],
            'total_students': stats['total_students'],
            'courses': stats['courses']
        }
        
        serializer = InstructorRevenueSerializer(instructor_data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def refresh(self, request, pk=None):
        """Refresh statistics for a course."""
        course_stats = self.get_object()
        course_stats.update_stats()
        
        serializer = self.get_serializer(course_stats)
        return Response(serializer.data)


class PriceHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for price history."""
    queryset = PriceHistory.objects.all().select_related('course', 'changed_by')
    serializer_class = PriceHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.role == 'student':
            # Students can't see price history
            queryset = queryset.none()
        elif user.role == 'teacher':
            queryset = queryset.filter(course__instructor=user)
        
        # Apply filters
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        changed_by_id = self.request.query_params.get('changed_by_id')
        if changed_by_id and user.role == 'admin':
            queryset = queryset.filter(changed_by_id=changed_by_id)
        
        return queryset


class PaymentLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for payment logs."""
    queryset = PaymentLog.objects.all().select_related(
        'actor', 'student', 'course', 'transaction'
    )
    serializer_class = PaymentLogSerializer
    permission_classes = [IsAdminUser]  # Only admins can view logs
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Apply filters
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        actor_id = self.request.query_params.get('actor_id')
        if actor_id:
            queryset = queryset.filter(actor_id=actor_id)
        
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        ip_address = self.request.query_params.get('ip_address')
        if ip_address:
            queryset = queryset.filter(ip_address=ip_address)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def suspicious_activities(self, request):
        """Get suspicious activities."""
        suspicious_actions = [
            'suspicious_recharge_attempts',
            'suspicious_purchase_rate'
        ]
        
        queryset = self.get_queryset().filter(action__in=suspicious_actions)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ==================== REPORT VIEWS ====================

class TopCoursesReportView(APIView):
    """View for top courses report."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get top courses report."""
        if request.user.role not in ['admin', 'teacher']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        limit = int(request.query_params.get('limit', 10))
        period = request.query_params.get('period')
        instructor_id = request.query_params.get('instructor_id')
        
        if request.user.role == 'teacher':
            instructor_id = request.user.id
        
        # Get data from service
        from reports.services import ReportService
        data = ReportService.get_top_selling_courses(limit, period, instructor_id)
        
        serializer = TopCoursesSerializer(data, many=True)
        return Response(serializer.data)


class StudentActivityReportView(APIView):
    """View for student activity report."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get student activity report."""
        student_id = request.query_params.get('student_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Get data from service
        from reports.services import ReportService
        data = ReportService.get_student_activity_report(student_id, start_date, end_date)
        
        serializer = StudentActivitySerializer(data, many=True)
        return Response(serializer.data)


class InstructorRevenueReportView(APIView):
    """View for instructor revenue report."""
    permission_classes = [IsAdminUser | IsTeacherUser]
    
    def get(self, request):
        """Get instructor revenue report."""
        if request.user.role == 'teacher':
            instructor_id = request.user.id
        else:
            instructor_id = request.query_params.get('instructor_id')
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Get data from service
        from reports.services import ReportService
        data = ReportService.get_instructor_revenue_report(instructor_id, start_date, end_date)
        
        if request.user.role == 'teacher':
            # Return single instructor data for teachers
            data = data[0] if data else {}
        
        serializer = InstructorRevenueSerializer(data, many=(request.user.role == 'admin'))
        return Response(serializer.data)


class RechargeCodeReportView(APIView):
    """View for recharge code report."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get recharge code report."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Get data from service
        from reports.services import ReportService
        data = ReportService.get_recharge_code_report(start_date, end_date)
        
        serializer = RechargeCodeReportSerializer(data)
        return Response(serializer.data)


class RefundReportView(APIView):
    """View for refund report."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get refund report."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Get data from service
        from reports.services import ReportService
        data = ReportService.get_refund_report(start_date, end_date)
        
        serializer = RefundReportSerializer(data)
        return Response(serializer.data)


class FailedTransactionsReportView(APIView):
    """View for failed transactions report."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get failed transactions report."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Get data from service
        from reports.services import ReportService
        data = ReportService.get_failed_transactions_report(start_date, end_date)
        
        serializer = FailedTransactionsReportSerializer(data)
        return Response(serializer.data)


# ==================== DASHBOARD & UTILITY VIEWS ====================

class DashboardStatsView(APIView):
    """View for dashboard statistics."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get dashboard data based on user role."""
        user = request.user
        
        # Get date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Get data from service
        from dashboard.services import DashboardService
        
        if user.role == 'admin':
            data = DashboardService.get_admin_dashboard(start_date, end_date)
        elif user.role == 'teacher':
            data = DashboardService.get_teacher_dashboard(user, start_date, end_date)
        elif user.role == 'student':
            data = DashboardService.get_student_dashboard(user, start_date, end_date)
        else:
            data = {}
        
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)


class BackupView(APIView):
    """View for backup operations."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Create a manual backup."""
        try:
            backup_file = BackupService.create_financial_backup()
            
            # Return download link
            import os
            filename = os.path.basename(backup_file)
            
            return Response({
                'message': 'Backup created successfully',
                'filename': filename,
                'download_url': f'/media/backups/financial/{filename}'
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Restore from backup."""
        backup_file = request.data.get('backup_file')
        if not backup_file:
            return Response(
                {'error': 'backup_file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Implementation for restore
        # Note: This is a simplified example
        return Response({'message': 'Restore functionality to be implemented'})


class ExportView(APIView):
    """View for exporting data."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Export data in various formats."""
        export_type = request.query_params.get('type', 'transactions')
        format_type = request.query_params.get('format', 'json')
        
        if export_type == 'transactions':
            data = self.export_transactions(format_type)
        elif export_type == 'purchases':
            data = self.export_purchases(format_type)
        elif export_type == 'recharge_codes':
            data = self.export_recharge_codes(format_type)
        elif export_type == 'course_stats':
            data = self.export_course_stats(format_type)
        else:
            return Response(
                {'error': 'Invalid export type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return data
    
    def export_transactions(self, format_type):
        """Export transactions."""
        transactions = Transaction.objects.all().select_related(
            'wallet__student', 'created_by'
        )
        
        if format_type == 'json':
            serializer = TransactionSerializer(transactions, many=True)
            return Response(serializer.data)
        elif format_type == 'csv':
            # CSV export implementation
            pass
        
        return Response({'error': 'Format not supported'})
    
    def export_purchases(self, format_type):
        """Export purchases."""
        purchases = Purchase.objects.all().select_related('student', 'course')
        
        if format_type == 'json':
            serializer = PurchaseSerializer(purchases, many=True)
            return Response(serializer.data)
        
        return Response({'error': 'Format not supported'})
    
    def export_recharge_codes(self, format_type):
        """Export recharge codes."""
        codes = RechargeCode.objects.all()
        
        if format_type == 'json':
            serializer = RechargeCodeSerializer(codes, many=True)
            return Response(serializer.data)
        elif format_type == 'csv':
            csv_data = BulkRechargeService.export_codes_to_csv(codes)
            response = HttpResponse(csv_data, content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="recharge_codes.csv"'
            return response
        
        return Response({'error': 'Format not supported'})
    
    def export_course_stats(self, format_type):
        """Export course statistics."""
        stats = CourseStats.objects.all().select_related('course__instructor')
        
        if format_type == 'json':
            serializer = CourseStatsSerializer(stats, many=True)
            return Response(serializer.data)
        
        return Response({'error': 'Format not supported'})


class FilterOptionsView(APIView):
    """View for filter options."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get available filter options."""
        from django.contrib.auth import get_user_model
        from courses.models import Course
        
        User = get_user_model()
        
        options = {}
        
        if request.user.role == 'admin':
            # Admin filter options
            options['instructors'] = list(User.objects.filter(
                role='teacher'
            ).values('id', 'email', 'first_name', 'last_name'))
            
            options['courses'] = list(Course.objects.filter(
                deleted_at__isnull=True
            ).values('id', 'title', 'instructor__email'))
            
            options['students'] = list(User.objects.filter(
                role='student'
            ).values('id', 'email', 'first_name', 'last_name'))
        
        elif request.user.role == 'teacher':
            # Teacher filter options
            options['my_courses'] = list(Course.objects.filter(
                instructor=request.user,
                deleted_at__isnull=True
            ).values('id', 'title'))
        
        return Response(options)