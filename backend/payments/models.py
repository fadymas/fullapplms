"""
Payments app models.
Implements wallet, transactions, recharge codes, and refunds.
Updated with new features: course stats, price history, payment logs.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import secrets

User = get_user_model()

from utils.dirtyfields import DirtyFieldsMixin


class Wallet(models.Model):
    """
    Student wallet for managing balance.
    Balance is calculated from transactions (immutable).
    """
    student = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='wallet',
        limit_choices_to={'role': 'student'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Wallet'
        verbose_name_plural = 'Wallets'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Wallet for {self.student.email}"
    
    @property
    def balance(self):
        """Calculate balance from transactions."""
        return self.transactions.aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')


class Transaction(models.Model):
    """
    Immutable transaction record.
    All wallet operations create transactions.
    """
    class TransactionType(models.TextChoices):
        DEPOSIT = 'deposit', 'Deposit'
        WITHDRAWAL = 'withdrawal', 'Withdrawal'
        PURCHASE = 'purchase', 'Purchase'
        REFUND = 'refund', 'Refund'
        RECHARGE_CODE = 'recharge_code', 'Recharge Code'
        MANUAL_DEPOSIT = 'manual_deposit', 'Manual Deposit'
    
    class PaymentMethod(models.TextChoices):
        WALLET = 'wallet', 'Wallet'
        FAWRY = 'fawry', 'Fawry'
        MANUAL = 'manual', 'Manual Deposit'
        RECHARGE_CODE = 'recharge_code', 'Recharge Code'
    
    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
        db_index=True
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.WALLET
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Positive for deposits, negative for withdrawals'
    )
    description = models.TextField()
    reason = models.TextField(blank=True, null=True, help_text='Reason for transaction')
    
    # Related objects
    purchase = models.ForeignKey(
        'Purchase',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    recharge_code = models.ForeignKey(
        'RechargeCode',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_transactions'
    )
    
    class Meta:
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['wallet', '-created_at']),
            models.Index(fields=['transaction_type', '-created_at']),
            models.Index(fields=['payment_method', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amount} for {self.wallet.student.email}"
    
    def clean(self):
        """Validate transaction."""
        if self.transaction_type in [self.TransactionType.WITHDRAWAL, self.TransactionType.PURCHASE]:
            if self.amount > 0:
                raise ValidationError('Withdrawal and purchase amounts must be negative.')
        elif self.transaction_type in [self.TransactionType.DEPOSIT, self.TransactionType.REFUND, self.TransactionType.RECHARGE_CODE, self.TransactionType.MANUAL_DEPOSIT]:
            if self.amount < 0:
                raise ValidationError('Deposit and refund amounts must be positive.')


class Purchase(DirtyFieldsMixin, models.Model):
    """
    Course purchase record.
    Links student, course, and transaction.
    """
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='purchases',
        limit_choices_to={'role': 'student'}
    )
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.PROTECT,
        related_name='purchases'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    price_at_purchase = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Price of course at time of purchase'
    )

    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.PROTECT,
        related_name='purchase_record'
    )
    purchased_at = models.DateTimeField(auto_now_add=True)
    refunded = models.BooleanField(default=False)
    refunded_at = models.DateTimeField(null=True, blank=True)
    refund_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = 'Purchase'
        verbose_name_plural = 'Purchases'
        unique_together = ['student', 'course']
        indexes = [
            models.Index(fields=['student', '-purchased_at']),
            models.Index(fields=['course', '-purchased_at']),
            models.Index(fields=['refunded']),
        ]
    
    def __str__(self):
        return f"{self.student.email} - {self.course.title} - {self.amount}"
    
    def save(self, *args, **kwargs):
        """Save purchase with price_at_purchase."""
        if not self.price_at_purchase and self.course:
            self.price_at_purchase = self.course.price
        super().save(*args, **kwargs)


class RechargeCode(DirtyFieldsMixin, models.Model):
    """
    Recharge codes for wallet top-up.
    Single-use only.
    """
    code = models.CharField(max_length=50, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_used = models.BooleanField(default=False)
    used_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='used_recharge_codes',
        limit_choices_to={'role': 'student'}
    )
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_recharge_codes'
    )
    
    class Meta:
        verbose_name = 'Recharge Code'
        verbose_name_plural = 'Recharge Codes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code', 'is_used']),
            models.Index(fields=['created_by', 'created_at']),
        ]
    
    def __str__(self):
        return f"Code: {self.code} - {self.amount}"
    
    def clean(self):
        """Validate recharge code."""
        if self.expires_at and self.expires_at < timezone.now():
            raise ValidationError('Recharge code has expired.')
    
    def is_valid(self):
        """Check if code is valid for use."""
        if self.is_used:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True
    
    @classmethod
    def generate_code(cls):
        """Generate a unique recharge code."""
        while True:
            code = f"RECHARGE_{secrets.token_urlsafe(10)}"
            if not cls.objects.filter(code=code).exists():
                return code


# ==================== NEW MODELS ====================

class CourseStats(DirtyFieldsMixin, models.Model):
    """Cached statistics for courses."""
    course = models.OneToOneField(
        'courses.Course',
        on_delete=models.CASCADE,
        related_name='stats'
    )
    total_purchases = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    active_students = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Course Statistics'
        verbose_name_plural = 'Course Statistics'
        indexes = [
            models.Index(fields=['course', 'total_revenue']),
            models.Index(fields=['total_revenue']),
        ]
    
    def __str__(self):
        return f"Stats for {self.course.title}"
    
    def update_stats(self):
        """Update cached statistics."""
        from django.db.models import Count, Sum
        
        purchases = Purchase.objects.filter(
            course=self.course,
            refunded=False
        )
        
        self.total_purchases = purchases.count()
        self.total_revenue = purchases.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # Count unique active students
        self.active_students = purchases.values('student').distinct().count()
        self.save(update_fields=['total_purchases', 'total_revenue', 'active_students', 'last_updated'])


class PriceHistory(models.Model):
    """Historical price changes for courses."""
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.CASCADE,
        related_name='price_history'
    )
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'Price History'
        verbose_name_plural = 'Price History'
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['course', '-changed_at']),
        ]
    
    def __str__(self):
        return f"{self.course.title}: {self.old_price} → {self.new_price}"
    
    @property
    def price_difference(self):
        """Calculate price difference."""
        return self.new_price - self.old_price


class PaymentLog(models.Model):
    """Detailed logs for all payment actions."""
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='payment_actions'
    )
    action = models.CharField(max_length=100, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    student = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='payment_logs',
        limit_choices_to={'role': 'student'}
    )
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    session_id = models.CharField(max_length=255, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        verbose_name = 'Payment Log'
        verbose_name_plural = 'Payment Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action', 'created_at']),
            models.Index(fields=['student', 'created_at']),
            models.Index(fields=['ip_address', 'created_at']),
            models.Index(fields=['actor', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.action} by {self.actor} at {self.created_at}"
    
    @classmethod
    def log_action(cls, actor, action, **kwargs):
        """Convenience method to log an action."""
        return cls.objects.create(
            actor=actor,
            action=action,
            student=kwargs.get('student'),
            course=kwargs.get('course'),
            transaction=kwargs.get('transaction'),
            amount=kwargs.get('amount'),
            ip_address=kwargs.get('ip_address'),
            user_agent=kwargs.get('user_agent'),
            session_id=kwargs.get('session_id'),
            metadata=kwargs.get('metadata', {})
        )