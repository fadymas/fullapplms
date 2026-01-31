"""
Views for dashboard app.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .services import DashboardService
from .serializers import (
    DashboardStatsSerializer,
    FilterOptionSerializer,
    DateRangeSerializer
)


class DashboardView(APIView):
    """View for dashboard data."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get dashboard data based on user role."""
        # Validate date range
        serializer = DateRangeSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        start_date = validated_data.get('start_date')
        end_date = validated_data.get('end_date')
        period = validated_data.get('period')
        
        # Convert period to dates if provided
        if period and not (start_date or end_date):
            start_date, end_date = self._get_dates_from_period(period)
        
        user = request.user
        
        if user.role == 'admin':
            data = DashboardService.get_admin_dashboard(start_date, end_date)
        elif user.role == 'teacher':
            data = DashboardService.get_teacher_dashboard(user, start_date, end_date)
        elif user.role == 'student':
            data = DashboardService.get_student_dashboard(user, start_date, end_date)
        else:
            data = {}
        
        # DashboardService returns different shapes for admin/teacher/student.
        # DashboardStatsSerializer expects an `overview` key; if the service
        # returned a different shape (e.g. student dashboard), avoid raising
        # a KeyError by falling back to returning the raw data.
        try:
            dashboard_serializer = DashboardStatsSerializer(data)
            return Response(dashboard_serializer.data)
        except KeyError:
            return Response(data)
    
    def _get_dates_from_period(self, period):
        """Convert period string to start and end dates."""
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now().date()
        
        if period == 'today':
            return today, today
        elif period == 'yesterday':
            yesterday = today - timedelta(days=1)
            return yesterday, yesterday
        elif period == 'week':
            start_date = today - timedelta(days=7)
            return start_date, today
        elif period == 'month':
            start_date = today - timedelta(days=30)
            return start_date, today
        elif period == 'quarter':
            start_date = today - timedelta(days=90)
            return start_date, today
        elif period == 'year':
            start_date = today - timedelta(days=365)
            return start_date, today
        else:
            return None, None


class FilterOptionsView(APIView):
    """View for filter options."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get available filter options based on user role."""
        options = DashboardService.get_filter_options(request.user)
        serializer = FilterOptionSerializer(options)
        return Response(serializer.data)


class DashboardExportView(APIView):
    """View for exporting dashboard data."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Export dashboard data in various formats."""
        import json
        from datetime import datetime
        
        format_type = request.query_params.get('format', 'json')
        data_type = request.query_params.get('type', 'overview')
        
        # Get dashboard data
        dashboard_view = DashboardView()
        response = dashboard_view.get(request)
        
        if response.status_code != 200:
            return response
        
        data = response.data
        
        # Filter data based on type
        if data_type == 'overview' and 'overview' in data:
            export_data = data['overview']
            filename = f'dashboard_overview_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        elif data_type == 'monthly' and 'monthly_data' in data:
            export_data = data['monthly_data']
            filename = f'dashboard_monthly_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        elif data_type == 'weekly' and 'weekly_data' in data:
            export_data = data['weekly_data']
            filename = f'dashboard_weekly_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        else:
            export_data = data
            filename = f'dashboard_full_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        
        # Export based on format
        if format_type == 'json':
            from django.http import HttpResponse
            response = HttpResponse(
                json.dumps(export_data, indent=2, default=str),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}.json"'
            return response
        
        elif format_type == 'csv':
            # Simple CSV exporter: support lists of dicts or dicts.
            import csv
            from io import StringIO
            from django.http import HttpResponse

            output = StringIO()

            # If export_data is a list of dict-like items
            if isinstance(export_data, list) and export_data and isinstance(export_data[0], dict):
                # gather all keys
                headers = set()
                for row in export_data:
                    headers.update(row.keys())
                headers = list(headers)
                writer = csv.DictWriter(output, fieldnames=headers)
                writer.writeheader()
                for row in export_data:
                    # convert non-serializable values
                    safe_row = {k: (v.isoformat() if hasattr(v, 'isoformat') else str(v) if v is not None else '') for k, v in row.items()}
                    writer.writerow(safe_row)
            elif isinstance(export_data, dict):
                writer = csv.writer(output)
                writer.writerow(['key', 'value'])
                for k, v in export_data.items():
                    if isinstance(v, (list, dict)):
                        writer.writerow([k, json.dumps(v, default=str, ensure_ascii=False)])
                    else:
                        writer.writerow([k, str(v)])
            else:
                # Fallback: write string representation
                writer = csv.writer(output)
                writer.writerow(['value'])
                writer.writerow([json.dumps(export_data, default=str, ensure_ascii=False)])

            resp = HttpResponse(output.getvalue(), content_type='text/csv')
            resp['Content-Disposition'] = f'attachment; filename="{filename}.csv"'
            return resp
        
        return Response(
            {'error': 'Unsupported export format'},
            status=status.HTTP_400_BAD_REQUEST
        )