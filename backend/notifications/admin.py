"""
Admin configuration for notifications app.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'user_email', 'title_short', 'notification_type_display',
        'is_read_status', 'is_important_display', 'created_at'
    ]
    list_filter = ['notification_type', 'is_read', 'is_important', 'created_at']
    search_fields = ['user__email', 'title', 'message']
    readonly_fields = ['created_at', 'read_at', 'metadata_display']
    list_per_page = 50
    
    fieldsets = (
        ('Notification Information', {
            'fields': ('user', 'title', 'message', 'notification_type')
        }),
        ('Status', {
            'fields': ('is_read', 'is_important', 'read_at')
        }),
        ('Related Objects', {
            'fields': ('related_transaction', 'related_course', 'related_purchase'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('metadata_display',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'
    
    def title_short(self, obj):
        if len(obj.title) > 50:
            return obj.title[:50] + '...'
        return obj.title
    title_short.short_description = 'Title'
    
    def notification_type_display(self, obj):
        colors = {
            'wallet_recharge': 'blue',
            'purchase': 'green',
            'refund': 'orange',
            'security': 'red',
            'system': 'gray',
            'promotion': 'purple'
        }
        color = colors.get(obj.notification_type, 'black')
        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            obj.get_notification_type_display()
        )
    notification_type_display.short_description = 'Type'
    
    def is_read_status(self, obj):
        if obj.is_read:
            return mark_safe('<span style="color: green;">✓ Read</span>')
        return mark_safe('<span style="color: red; font-weight: bold;">✗ Unread</span>')
    is_read_status.short_description = 'Read Status'
    
    def is_important_display(self, obj):
        if obj.is_important:
            return mark_safe('<span style="color: red; font-weight: bold;">⚠ Important</span>')
        return '-'
    is_important_display.short_description = 'Important'
    
    def metadata_display(self, obj):
        import json
        from django.core.serializers.json import DjangoJSONEncoder
        return format_html(
            '<pre style="max-height: 200px; overflow: auto;">{}</pre>',
            json.dumps(obj.metadata, indent=2, ensure_ascii=False, cls=DjangoJSONEncoder)
        )
    metadata_display.short_description = 'Metadata'
    
    def has_add_permission(self, request):
        return False
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('user', 'related_transaction', 'related_course', 'related_purchase')
        return queryset