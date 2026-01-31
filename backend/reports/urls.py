"""
URLs for reports app.
"""
from django.urls import path
from .views import (
    TopCoursesReportView,
    StudentActivityReportView,
    RechargeCodeReportView,
    RefundReportView,
    InstructorRevenueReportView,
    FailedTransactionsReportView,
    ExportReportView
)

urlpatterns = [
    path('top-courses/', TopCoursesReportView.as_view(), name='top-courses'),
    path('student-activity/', StudentActivityReportView.as_view(), name='student-activity'),
    path('recharge-codes/', RechargeCodeReportView.as_view(), name='recharge-codes'),
    path('refunds/', RefundReportView.as_view(), name='refunds'),
    path('instructor-revenue/', InstructorRevenueReportView.as_view(), name='instructor-revenue'),
    path('failed-transactions/', FailedTransactionsReportView.as_view(), name='failed-transactions'),
    path('export/', ExportReportView.as_view(), name='export-report'),
]