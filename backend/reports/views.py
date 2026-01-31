"""
Views for reports app.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
import csv
import json

from users.permissions import IsAdminUser, IsTeacherUser
from .services import ReportService
from .serializers import (
    TopCoursesReportSerializer,
    StudentActivityReportSerializer,
    RechargeCodeReportSerializer,
    RefundReportSerializer,
    InstructorRevenueReportSerializer,
    FailedTransactionsReportSerializer
)


class TopCoursesReportView(APIView):
    """View for top courses report."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get top courses report."""
        if request.user.role not in ['admin', 'teacher']:
            return Response(
                {'error': 'Permission denied'},
                status=403
            )
        
        limit = int(request.query_params.get('limit', 10))
        period = request.query_params.get('period')
        instructor_id = request.query_params.get('instructor_id')
        
        if request.user.role == 'teacher':
            instructor_id = request.user.id
        
        data = ReportService.get_top_selling_courses(limit, period, instructor_id)
        
        # Export format
        export_format = request.query_params.get('format', 'json')
        
        if export_format == 'csv':
            return self.export_to_csv(data)
        
        serializer = TopCoursesReportSerializer(data, many=True)
        return Response(serializer.data)
    
    def export_to_csv(self, data):
        """Export report to CSV."""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="top_courses.csv"'
        
        writer = csv.writer(response)
        
        # Write header
        writer.writerow([
            'Course ID', 'Course Title', 'Instructor Email',
            'Instructor Name', 'Price', 'Total Purchases',
            'Total Revenue', 'Active Students', 'Last Updated'
        ])
        
        # Write data
        for item in data:
            writer.writerow([
                item['course__id'],
                item['course__title'],
                item['course__instructor__email'],
                f"{item['course__instructor__first_name']} {item['course__instructor__last_name']}",
                item['course__price'],
                item['total_purchases'],
                item['total_revenue'],
                item['active_students'],
                item['last_updated']
            ])
        
        return response


class StudentActivityReportView(APIView):
    """View for student activity report."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get student activity report."""
        student_id = request.query_params.get('student_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        data = ReportService.get_student_activity_report(student_id, start_date, end_date)
        
        # Export format
        export_format = request.query_params.get('format', 'json')
        
        if export_format == 'csv':
            return self.export_to_csv(data)
        
        serializer = StudentActivityReportSerializer(data, many=True)
        return Response(serializer.data)
    
    def export_to_csv(self, data):
        """Export report to CSV."""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="student_activity.csv"'
        
        writer = csv.writer(response)
        
        # Write header
        writer.writerow([
            'Student ID', 'Student Email', 'Student Name',
            'Wallet Balance', 'Total Deposits', 'Total Withdrawals',
            'Total Purchases', 'Total Spent', 'Total Refunds',
            'Net Spent', 'Last Activity'
        ])
        
        # Write data
        for item in data:
            writer.writerow([
                item['student_id'],
                item['student_email'],
                item['student_name'],
                item['wallet_balance'],
                item['total_deposits'],
                item['total_withdrawals'],
                item['total_purchases'],
                item['total_spent'],
                item['total_refunds'],
                item['net_spent'],
                item['last_activity']
            ])
        
        return response


class RechargeCodeReportView(APIView):
    """View for recharge code report."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get recharge code report."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
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
        
        data = ReportService.get_refund_report(start_date, end_date)
        
        serializer = RefundReportSerializer(data)
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
        
        data = ReportService.get_instructor_revenue_report(instructor_id, start_date, end_date)
        
        if request.user.role == 'teacher':
            # Return single instructor data for teachers
            data = data[0] if data else {}
        
        serializer = InstructorRevenueReportSerializer(data, many=(request.user.role == 'admin'))
        return Response(serializer.data)


class FailedTransactionsReportView(APIView):
    """View for failed transactions report."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get failed transactions report."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        data = ReportService.get_failed_transactions_report(start_date, end_date)
        
        serializer = FailedTransactionsReportSerializer(data)
        return Response(serializer.data)


class ExportReportView(APIView):
    """View for exporting reports."""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Export report in specified format."""
        report_type = request.query_params.get('type')
        
        if not report_type:
            return Response(
                {'error': 'Report type is required'},
                status=400
            )
        
        # Get common parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        format_type = request.query_params.get('format', 'json')
        
        # Generate report based on type
        if report_type == 'top_courses':
            data = ReportService.get_top_selling_courses(
                limit=100,
                period=None,
                instructor_id=request.query_params.get('instructor_id')
            )
            filename = 'top_courses'
            
        elif report_type == 'student_activity':
            data = ReportService.get_student_activity_report(
                student_id=request.query_params.get('student_id'),
                start_date=start_date,
                end_date=end_date
            )
            filename = 'student_activity'
            
        elif report_type == 'recharge_codes':
            data = ReportService.get_recharge_code_report(start_date, end_date)
            filename = 'recharge_codes'
            
        elif report_type == 'refunds':
            data = ReportService.get_refund_report(start_date, end_date)
            filename = 'refunds'
            
        elif report_type == 'instructor_revenue':
            data = ReportService.get_instructor_revenue_report(
                instructor_id=request.query_params.get('instructor_id'),
                start_date=start_date,
                end_date=end_date
            )
            filename = 'instructor_revenue'
            
        elif report_type == 'failed_transactions':
            data = ReportService.get_failed_transactions_report(start_date, end_date)
            filename = 'failed_transactions'
            
        else:
            return Response(
                {'error': 'Invalid report type'},
                status=400
            )
        
        # Export based on format
        if format_type == 'json':
            response = HttpResponse(
                json.dumps(data, indent=2, default=str),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}.json"'
            return response
            
        elif format_type == 'csv':
            # CSV export implementation would go here
            pass
        
        return Response(
            {'error': 'Unsupported format'},
            status=400
        )