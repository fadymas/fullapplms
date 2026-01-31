"""
Admin configuration for payments app.
Updated with new models and enhanced admin interfaces.
"""
from django.contrib import admin
from django.db.models import Sum, Count
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import (
    Wallet, Transaction, Purchase, RechargeCode,
    CourseStats, PriceHistory, PaymentLog
)


# ==================== INLINE ADMIN CLASSES ====================

class TransactionInline(admin.TabularInline):
    """Inline for transactions in wallet admin."""
    model = Transaction
    extra = 0
    readonly_fields = ['transaction_type', 'amount', 'description', 'created_at']
    can_delete = False
    
    def has_add_permission(self, request, obj):
        return False


class PurchaseInline(admin.TabularInline):
    """Inline for purchases in wallet admin."""
    model = Purchase
    extra = 0
    readonly_fields = ['course', 'amount', 'purchased_at', 'refunded']
    can_delete = False
    
    def has_add_permission(self, request, obj):
        return False


class PriceHistoryInline(admin.TabularInline):
    """Inline for price history in course admin."""
    model = PriceHistory
    extra = 0
    readonly_fields = ['old_price', 'new_price', 'changed_by', 'changed_at', 'reason']
    can_delete = False
    
    def has_add_permission(self, request, obj):
        return False


# ==================== MAIN ADMIN CLASSES ====================

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['student_email', 'balance_display', 'transaction_count', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['student__email', 'student__first_name', 'student__last_name']
    readonly_fields = ['balance_display', 'created_at', 'updated_at', 'transaction_count']
    inlines = [TransactionInline]
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student', 'student_email')
        }),
        ('Wallet Details', {
            'fields': ('balance_display', 'transaction_count', 'created_at', 'updated_at')
        }),
    )
    
    def student_email(self, obj):
        return obj.student.email
    student_email.short_description = 'Student Email'
    student_email.admin_order_field = 'student__email'
    
    def balance_display(self, obj):
        return f"{obj.balance:,} EGP"
    balance_display.short_description = 'Balance'
    
    def transaction_count(self, obj):
        return obj.transactions.count()
    transaction_count.short_description = 'Transactions'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('student').prefetch_related('transactions')
        return queryset


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'student_email', 'transaction_type_display', 
        'payment_method_display', 'amount_display', 
        'description_short', 'created_at'
    ]
    list_filter = ['transaction_type', 'payment_method', 'created_at']
    search_fields = [
        'wallet__student__email', 
        'description', 
        'purchase__course__title'
    ]
    readonly_fields = [
        'created_at', 'student_email', 'course_title',
        'transaction_type_display', 'payment_method_display', 'amount_display'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Transaction Information', {
            'fields': (
                'transaction_type_display', 
                'payment_method_display',
                'amount_display',
                'description',
                'reason'
            )
        }),
        ('Related Objects', {
            'fields': ('wallet', 'student_email', 'purchase', 'course_title', 'recharge_code'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_email(self, obj):
        return obj.wallet.student.email
    student_email.short_description = 'Student Email'
    student_email.admin_order_field = 'wallet__student__email'
    
    def course_title(self, obj):
        if obj.purchase and obj.purchase.course:
            return obj.purchase.course.title
        return '-'
    course_title.short_description = 'Course'
    
    def transaction_type_display(self, obj):
        return obj.get_transaction_type_display()
    transaction_type_display.short_description = 'Type'
    transaction_type_display.admin_order_field = 'transaction_type'
    
    def payment_method_display(self, obj):
        return obj.get_payment_method_display()
    payment_method_display.short_description = 'Payment Method'
    payment_method_display.admin_order_field = 'payment_method'
    
    def amount_display(self, obj):
        if not obj or obj.amount is None:
            return '-'

        color = 'green' if obj.amount >= 0 else 'red'
        formatted = f"{abs(obj.amount):,}"
        return format_html(
            '<span style="color: {};">{} EGP</span>',
            color,
            formatted
        )
    amount_display.short_description = 'Amount'
    amount_display.admin_order_field = 'amount'
    
    def description_short(self, obj):
        if len(obj.description) > 50:
            return obj.description[:50] + '...'
        return obj.description
    description_short.short_description = 'Description'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related(
            'wallet__student', 
            'purchase__course',
            'recharge_code',
            'created_by'
        )
        return queryset


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = [
        'student_email', 'course_title', 
        'amount_display', 'price_at_purchase_display',
        'purchased_at', 'refunded_status'
    ]
    list_filter = ['refunded', 'purchased_at', 'course__instructor']
    search_fields = ['student__email', 'course__title', 'course__instructor__email']
    # include amount_display in readonly fields so it can be used in fieldsets safely
    readonly_fields = [
        'purchased_at', 'refunded_at', 
        'refund_reason', 'price_at_purchase_display',
        'current_course_price', 'amount_display'
    ]
    date_hierarchy = 'purchased_at'
    
    fieldsets = (
        ('Purchase Information', {
            'fields': ('student', 'course', 'amount_display', 'price_at_purchase_display')
        }),
        ('Current Course Price', {
            'fields': ('current_course_price',),
            'classes': ('collapse',)
        }),
        ('Transaction', {
            'fields': ('transaction',),
            'classes': ('collapse',)
        }),
        ('Refund Information', {
            'fields': ('refunded', 'refunded_at', 'refund_reason'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('purchased_at',),
            'classes': ('collapse',)
        }),
    )
    
    def student_email(self, obj):
        return obj.student.email
    student_email.short_description = 'Student Email'
    student_email.admin_order_field = 'student__email'
    
    def course_title(self, obj):
        return obj.course.title
    course_title.short_description = 'Course'
    course_title.admin_order_field = 'course__title'
    
    def amount_display(self, obj):
        if not obj or obj.amount is None:
            return '-'
        return f"{obj.amount:,} EGP"
    amount_display.short_description = 'Amount'
    
    def price_at_purchase_display(self, obj):
        return f"{obj.price_at_purchase:,} EGP"
    price_at_purchase_display.short_description = 'Price at Purchase'
    
    def current_course_price(self, obj):
        return f"{obj.course.price:,} EGP"
    current_course_price.short_description = 'Current Price'
    
    def refunded_status(self, obj):
        if obj.refunded:
            return mark_safe('<span style="color: red; font-weight: bold;">✓ REFUNDED</span>')
        return mark_safe('<span style="color: green;">Active</span>')
    refunded_status.short_description = 'Status'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('student', 'course', 'transaction')
        return queryset


@admin.register(RechargeCode)
class RechargeCodeAdmin(admin.ModelAdmin):
    list_display = [
        'code_short', 'amount_display', 'status', 
        'used_by_email', 'created_by_email', 'created_at'
    ]
    list_filter = ['is_used', 'created_at', 'expires_at']
    search_fields = ['code', 'used_by__email', 'created_by__email']
    readonly_fields = ['is_used', 'used_by', 'used_at', 'is_valid_display']
    actions = ['mark_as_used', 'mark_as_unused']
    
    fieldsets = (
        ('Code Information', {
            'fields': ('code', 'amount_display', 'is_valid_display')
        }),
        ('Usage Information', {
            'fields': ('is_used', 'used_by', 'used_at')
        }),
        ('Creation Information', {
            'fields': ('created_by', 'created_at')
        }),
        ('Expiration', {
            'fields': ('expires_at',),
            'classes': ('collapse',)
        }),
    )
    
    def code_short(self, obj):
        if len(obj.code) > 15:
            return obj.code[:15] + '...'
        return obj.code
    code_short.short_description = 'Code'
    code_short.admin_order_field = 'code'
    
    def amount_display(self, obj):
        return f"{obj.amount:,} EGP"
    amount_display.short_description = 'Amount'
    
    def used_by_email(self, obj):
        return obj.used_by.email if obj.used_by else '-'
    used_by_email.short_description = 'Used By'
    used_by_email.admin_order_field = 'used_by__email'
    
    def created_by_email(self, obj):
        return obj.created_by.email if obj.created_by else '-'
    created_by_email.short_description = 'Created By'
    created_by_email.admin_order_field = 'created_by__email'
    
    def status(self, obj):
        if obj.is_used:
            return mark_safe('<span style="color: gray;">Used</span>')
        elif obj.expires_at and obj.expires_at < timezone.now():
            return mark_safe('<span style="color: orange;">Expired</span>')
        else:
            return mark_safe('<span style="color: green;">Active</span>')
    status.short_description = 'Status'
    
    def is_valid_display(self, obj):
        if obj.is_valid():
            return mark_safe('<span style="color: green;">✓ Valid</span>')
        return mark_safe('<span style="color: red;">✗ Invalid</span>')
    is_valid_display.short_description = 'Is Valid'
    
    def mark_as_used(self, request, queryset):
        queryset.update(is_used=True, used_at=timezone.now())
        self.message_user(request, f"{queryset.count()} codes marked as used.")
    mark_as_used.short_description = "Mark selected codes as used"
    
    def mark_as_unused(self, request, queryset):
        queryset.update(is_used=False, used_by=None, used_at=None)
        self.message_user(request, f"{queryset.count()} codes marked as unused.")
    mark_as_unused.short_description = "Mark selected codes as unused"
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('used_by', 'created_by')
        return queryset


# ==================== NEW ADMIN CLASSES ====================

@admin.register(CourseStats)
class CourseStatsAdmin(admin.ModelAdmin):
    list_display = [
        'course_title', 'instructor_email',
        'total_purchases', 'total_revenue_display', 
        'active_students', 'last_updated'
    ]
    list_filter = ['last_updated', 'course__instructor']
    search_fields = ['course__title', 'course__instructor__email']
    readonly_fields = [
        'total_purchases', 'total_revenue_display', 
        'active_students', 'last_updated',
        'average_revenue_per_student'
    ]
    
    fieldsets = (
        ('Course Information', {
            'fields': ('course', 'course_title', 'instructor_email')
        }),
        ('Statistics', {
            'fields': (
                'total_purchases', 
                'total_revenue_display',
                'active_students',
                'average_revenue_per_student'
            )
        }),
        ('Metadata', {
            'fields': ('last_updated',),
            'classes': ('collapse',)
        }),
    )
    
    def course_title(self, obj):
        return obj.course.title
    course_title.short_description = 'Course'
    course_title.admin_order_field = 'course__title'
    
    def instructor_email(self, obj):
        return obj.course.instructor.email if obj.course.instructor else '-'
    instructor_email.short_description = 'Instructor'
    instructor_email.admin_order_field = 'course__instructor__email'
    
    def total_revenue_display(self, obj):
        return f"{obj.total_revenue:,} EGP"
    total_revenue_display.short_description = 'Total Revenue'
    
    def average_revenue_per_student(self, obj):
        if obj.active_students > 0:
            average = obj.total_revenue / obj.active_students
            return f"{average:,.2f} EGP"
        return "0.00 EGP"
    average_revenue_per_student.short_description = 'Avg. per Student'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('course__instructor')
        return queryset


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'course_title', 'old_price_display', 
        'new_price_display', 'price_difference_display',
        'changed_by_email', 'changed_at', 'reason_short'
    ]
    list_filter = ['changed_at', 'course__instructor']
    search_fields = ['course__title', 'reason', 'changed_by__email']
    readonly_fields = ['changed_at']
    date_hierarchy = 'changed_at'
    
    def course_title(self, obj):
        return obj.course.title
    course_title.short_description = 'Course'
    course_title.admin_order_field = 'course__title'
    
    def old_price_display(self, obj):
        return f"{obj.old_price:,} EGP"
    old_price_display.short_description = 'Old Price'
    
    def new_price_display(self, obj):
        return f"{obj.new_price:,} EGP"
    new_price_display.short_description = 'New Price'
    
    def price_difference_display(self, obj):
        difference = obj.new_price - obj.old_price
        color = 'green' if difference >= 0 else 'red'
        sign = '+' if difference >= 0 else ''
        formatted = f"{abs(difference):,}"
        return format_html(
            '<span style="color: {};">{}{} EGP</span>',
            color,
            sign,
            formatted
        )
    price_difference_display.short_description = 'Difference'
    
    def changed_by_email(self, obj):
        return obj.changed_by.email if obj.changed_by else '-'
    changed_by_email.short_description = 'Changed By'
    changed_by_email.admin_order_field = 'changed_by__email'
    
    def reason_short(self, obj):
        if obj.reason and len(obj.reason) > 30:
            return obj.reason[:30] + '...'
        return obj.reason or '-'
    reason_short.short_description = 'Reason'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('course', 'changed_by')
        return queryset


@admin.register(PaymentLog)
class PaymentLogAdmin(admin.ModelAdmin):
    list_display = [
        'action_display', 'actor_email', 
        'student_email', 'amount_display',
        'ip_short', 'created_at'
    ]
    list_filter = ['action', 'created_at']
    search_fields = [
        'actor__email', 'student__email', 
        'action', 'ip_address'
    ]
    readonly_fields = all_fields = [
        'action', 'actor', 'amount_display',
        'student', 'course', 'transaction',
        'ip_address', 'user_agent', 'session_id',
        'metadata_display', 'created_at'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Action Information', {
            'fields': ('action', 'actor', 'amount_display')
        }),
        ('Related Objects', {
            'fields': ('student', 'course', 'transaction'),
            'classes': ('collapse',)
        }),
        ('Request Information', {
            'fields': ('ip_address', 'user_agent', 'session_id'),
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
    
    def action_display(self, obj):
        # Color code actions
        colors = {
            'suspicious': 'red',
            'purchase': 'green',
            'refund': 'orange',
            'deposit': 'blue',
            'withdrawal': 'purple'
        }
        
        color = 'black'
        for key, value in colors.items():
            if key in obj.action.lower():
                color = value
                break
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.action.replace('_', ' ').title()
        )
    action_display.short_description = 'Action'
    
    def actor_email(self, obj):
        return obj.actor.email if obj.actor else 'System'
    actor_email.short_description = 'Actor'
    actor_email.admin_order_field = 'actor__email'
    
    def student_email(self, obj):
        return obj.student.email if obj.student else '-'
    student_email.short_description = 'Student'
    student_email.admin_order_field = 'student__email'
    
    def amount_display(self, obj):
        if obj.amount:
            color = 'green' if obj.amount >= 0 else 'red'
            formatted = f"{abs(obj.amount):,}"
            return format_html(
                '<span style="color: {};">{} EGP</span>',
                color,
                formatted
            )
        return '-'
    amount_display.short_description = 'Amount'
    
    def ip_short(self, obj):
        return obj.ip_address or '-'
    ip_short.short_description = 'IP'
    
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
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.select_related('actor', 'student', 'course', 'transaction')
        return queryset


# ==================== ADMIN SITE CONFIGURATION ====================

# Import timezone at module level
from django.utils import timezone

# Custom admin site header
admin.site.site_header = "E-Learning Payment System Administration"
admin.site.site_title = "Payment System Admin"
admin.site.index_title = "Welcome to Payment System Administration"