"""
URLs for payments app.
Updated with new endpoints for reports, dashboard, and utility functions.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WalletViewSet, TransactionViewSet, PurchaseViewSet, RechargeCodeViewSet,
    CourseStatsViewSet, PriceHistoryViewSet, PaymentLogViewSet,
    TopCoursesReportView, StudentActivityReportView, InstructorRevenueReportView,
    RechargeCodeReportView, RefundReportView, FailedTransactionsReportView,
    DashboardStatsView, BackupView, ExportView, FilterOptionsView
)

router = DefaultRouter()
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'purchases', PurchaseViewSet, basename='purchase')
router.register(r'recharge-codes', RechargeCodeViewSet, basename='recharge-code')
router.register(r'course-stats', CourseStatsViewSet, basename='course-stats')
router.register(r'price-history', PriceHistoryViewSet, basename='price-history')
router.register(r'payment-logs', PaymentLogViewSet, basename='payment-log')

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Reports
    path('reports/top-courses/', TopCoursesReportView.as_view(), name='top-courses-report'),
    path('reports/student-activity/', StudentActivityReportView.as_view(), name='student-activity-report'),
    path('reports/instructor-revenue/', InstructorRevenueReportView.as_view(), name='instructor-revenue-report'),
    path('reports/recharge-codes/', RechargeCodeReportView.as_view(), name='recharge-codes-report'),
    path('reports/refunds/', RefundReportView.as_view(), name='refunds-report'),
    path('reports/failed-transactions/', FailedTransactionsReportView.as_view(), name='failed-transactions-report'),
    
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/filter-options/', FilterOptionsView.as_view(), name='filter-options'),
    
    # Backup & Export
    path('backup/', BackupView.as_view(), name='backup'),
    path('export/', ExportView.as_view(), name='export'),
    
    # Health check
    path('health/', lambda request: __import__('json').__dict__['dumps']({'status': 'ok'}), name='health'),
]