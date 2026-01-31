"""
URLs for dashboard app.
"""
from django.urls import path
from .views import DashboardView, FilterOptionsView, DashboardExportView

urlpatterns = [
    path('', DashboardView.as_view(), name='dashboard'),
    path('filter-options/', FilterOptionsView.as_view(), name='filter-options'),
    path('export/', DashboardExportView.as_view(), name='dashboard-export'),
]