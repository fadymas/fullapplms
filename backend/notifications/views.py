"""
Views for notifications app.
"""
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from .models import Notification
from .serializers import (
    NotificationSerializer, 
    NotificationCountSerializer,
    MarkAsReadSerializer
)
from .services import NotificationService


class NotificationPagination(PageNumberPagination):
    """Custom pagination for notifications."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(mixins.ListModelMixin,
                         mixins.RetrieveModelMixin,
                         mixins.DestroyModelMixin,
                         viewsets.GenericViewSet):
    """ViewSet for notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationPagination
    
    def get_queryset(self):
        """Return notifications for current user."""
        queryset = Notification.objects.filter(user=self.request.user)
        
        # Apply filters
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        is_important = self.request.query_params.get('is_important')
        if is_important is not None:
            queryset = queryset.filter(is_important=is_important.lower() == 'true')
        
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Date filters
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(message__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def get_serializer_context(self):
        """Add request to serializer context."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications."""
        count = NotificationService.get_unread_count(request.user)
        important_count = NotificationService.get_unread_important_count(request.user)
        
        return Response({
            'unread_count': count,
            'unread_important_count': important_count
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get notification statistics."""
        stats = NotificationService.get_notification_stats(request.user)
        serializer = NotificationCountSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read."""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'status': 'marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """Mark a notification as unread."""
        notification = self.get_object()
        notification.mark_as_unread()
        return Response({'status': 'marked as unread'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read."""
        serializer = MarkAsReadSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        notification_ids = serializer.validated_data.get('notification_ids')
        
        if notification_ids:
            # Mark specific notifications
            Notification.objects.filter(
                id__in=notification_ids,
                user=request.user,
                is_read=False
            ).update(is_read=True)
            count = len(notification_ids)
        else:
            # Mark all notifications
            count = Notification.mark_all_as_read(request.user)
        
        return Response({
            'status': 'success',
            'marked_count': count,
            'message': f'Marked {count} notifications as read'
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent notifications (last 20)."""
        queryset = self.get_queryset()[:20]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def important(self, request):
        """Get important notifications."""
        queryset = self.get_queryset().filter(is_important=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Delete all read notifications."""
        deleted_count, _ = Notification.objects.filter(
            user=request.user,
            is_read=True
        ).delete()
        
        return Response({
            'status': 'success',
            'deleted_count': deleted_count,
            'message': f'Deleted {deleted_count} read notifications'
        })
    
    def perform_destroy(self, instance):
        """Ensure user can only delete their own notifications."""
        if instance.user != self.request.user:
            return Response(
                {'error': 'You can only delete your own notifications'},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()