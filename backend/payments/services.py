"""
Business logic services for payments app.
Updated with new services: course stats, price history, payment logs, etc.
FIXED: Updated purchase_course() method to work with balance property (not a database field)
"""
import logging
from django.db import transaction as db_transaction
from django.db import IntegrityError, DatabaseError
from django.db.models import F
import time
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import secrets
import json

from users.audit import AuditLogger
from users.models import AuditLog
from .models import (
    Wallet, Transaction, Purchase, RechargeCode,
    CourseStats, PriceHistory, PaymentLog
)
from datetime import timedelta
from utils.safe_serialize import convert_decimals

User = get_user_model()
logger = logging.getLogger(__name__)


class PaymentService:
    """Service for payment operations."""
    
    @staticmethod
    @db_transaction.atomic
    def create_wallet(student):
        """Create a wallet for a student."""
        if student.role != 'student':
            raise ValidationError('Only students can have wallets.')
        
        wallet, created = Wallet.objects.get_or_create(student=student)
        return wallet, created
    
    @staticmethod
    @db_transaction.atomic
    def deposit(wallet, amount, description, reason=None, created_by=None, request=None):
        """Deposit money into wallet."""
        if amount <= 0:
            raise ValidationError('Deposit amount must be positive.')
        
        # RACE CONDITION FIX: Lock wallet row for update
        wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)
        
        trans = Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.TransactionType.DEPOSIT,
            amount=amount,
            description=description,
            reason=reason,
            created_by=created_by
        )
        
        # Log the action
        PaymentLogService.log_deposit(
            actor=created_by,
            student=wallet.student,
            amount=amount,
            transaction=trans,
            reason=reason,
            request=request
        )
        
        # Update course stats if needed
        CourseStatsService.update_all_stats()
        
        return trans
    
    @staticmethod
    @db_transaction.atomic
    def withdraw(wallet, amount, description, reason=None, created_by=None, request=None):
        """Withdraw money from wallet."""
        if amount <= 0:
            raise ValidationError('Withdrawal amount must be positive.')
        
        # RACE CONDITION FIX: Lock wallet row for update
        wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)
        
        balance = wallet.balance
        if balance < amount:
            raise ValidationError(f'Insufficient balance. Current balance: {balance}')
        
        trans = Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.TransactionType.WITHDRAWAL,
            amount=-amount,
            description=description,
            reason=reason,
            created_by=created_by
        )
        
        PaymentLogService.log_withdrawal(
            actor=created_by,
            student=wallet.student,
            amount=amount,
            transaction=trans,
            reason=reason,
            request=request
        )
        
        return trans
    
    @staticmethod
    def purchase_course(student, course, request=None):
        """Purchase a course with row-locking and retry on conflicts.
        
        FIXED: balance is a property calculated from transactions, not a database field.
        Ensures only one successful purchase when concurrent attempts happen.
        """
        if student.role != 'student':
            raise ValidationError('Only students can purchase courses.')

        max_retries = 3
        for attempt in range(max_retries):
            try:
                with db_transaction.atomic():
                    # Lock wallet row to prevent concurrent modifications
                    wallet = Wallet.objects.select_for_update().get(student=student)

                    # Check if already purchased (re-check inside transaction)
                    if Purchase.objects.select_for_update().filter(
                        student=student, 
                        course=course, 
                        refunded=False
                    ).exists():
                        raise ValidationError('Course already purchased.')

                    # Check balance (balance is calculated from transactions)
                    current_balance = wallet.balance
                    if current_balance < course.price:
                        raise ValidationError(
                            f'Insufficient balance. Current balance: {current_balance}, '
                            f'Course price: {course.price}'
                        )

                    # IMPORTANT: Balance is calculated from transactions, so we don't need to 
                    # update wallet.balance directly. Just create the transaction.
                    
                    # Create purchase transaction
                    trans = Transaction.objects.create(
                        wallet=wallet,
                        transaction_type=Transaction.TransactionType.PURCHASE,
                        payment_method=Transaction.PaymentMethod.WALLET,
                        amount=-course.price,  # Negative amount for purchase
                        description=f"Purchase: {course.title}",
                        created_by=student
                    )

                    # Create purchase record
                    purchase = Purchase.objects.create(
                        student=student,
                        course=course,
                        amount=course.price,
                        price_at_purchase=course.price,
                        transaction=trans
                    )

                    # Link transaction to purchase
                    trans.purchase = purchase
                    trans.save(update_fields=['purchase'])

                    # Lock course price if first purchase
                    if not course.price_locked:
                        course.lock_price()

                    # Create enrollment
                    from courses.services import EnrollmentService
                    EnrollmentService.enroll_student(student, course)

                    # Log the purchase
                    PaymentLogService.log_purchase(
                        actor=student,
                        student=student,
                        course=course,
                        amount=course.price,
                        transaction=trans,
                        request=request
                    )

                    # Update course stats
                    CourseStatsService.update_course_stats(course)

                    # Send notification
                    from notifications.services import NotificationService
                    NotificationService.send_purchase_notification(student, course, trans)

                    return purchase

            except ValidationError:
                # business validation - re-raise immediately
                raise
            except IntegrityError as e:
                # Retry on possible race-related DB constraint failures
                logger.warning("IntegrityError on purchase_course attempt %s: %s", attempt + 1, str(e))
                if attempt == max_retries - 1:
                    raise
                time.sleep(0.1 * (attempt + 1))
            except DatabaseError as e:
                # Generic DB errors - retry a few times
                logger.warning("DatabaseError on purchase_course attempt %s: %s", attempt + 1, str(e))
                if attempt == max_retries - 1:
                    raise
                time.sleep(0.1 * (attempt + 1))
    
    @staticmethod
    @db_transaction.atomic
    def refund_purchase(student, course, reason=None, admin=None, request=None):
        """Refund a purchase."""
        try:
            purchase = Purchase.objects.get(
                student=student,
                course=course,
                refunded=False
            )
        except Purchase.DoesNotExist:
            raise ValidationError('No active purchase found for this course.')
        
        # Create refund transaction
        wallet, _ = PaymentService.create_wallet(student)
        trans = Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.TransactionType.REFUND,
            payment_method=Transaction.PaymentMethod.WALLET,
            amount=purchase.amount,
            description=f"Refund for: {course.title}",
            reason=reason,
            created_by=admin or student,
            purchase=purchase
        )
        
        # Mark purchase as refunded
        purchase.refunded = True
        purchase.refunded_at = timezone.now()
        purchase.refund_reason = reason
        purchase.save(update_fields=['refunded', 'refunded_at', 'refund_reason'])
        
        # Unenroll student
        from courses.services import EnrollmentService
        EnrollmentService.unenroll_student(student, course)
        
        # Log the refund
        PaymentLogService.log_refund(
            actor=admin,
            student=student,
            course=course,
            amount=purchase.amount,
            transaction=trans,
            reason=reason,
            request=request
        )
        
        # Update course stats
        CourseStatsService.update_course_stats(course)
        
        # Send notification
        from notifications.services import NotificationService
        NotificationService.send_refund_notification(student, purchase.amount, trans)
        
        return trans
    
    @staticmethod
    @db_transaction.atomic
    def use_recharge_code(student, code, request=None):
        """Use a recharge code."""
        # RACE CONDITION FIX: Lock recharge code row for update
        try:
            recharge_code = RechargeCode.objects.select_for_update().get(code=code)
        except RechargeCode.DoesNotExist:
            raise ValidationError('Invalid recharge code.')
        
        if not recharge_code.is_valid():
            raise ValidationError('Recharge code is invalid or already used.')
        
        # Check for suspicious activity
        SuspiciousActivityService.check_recharge_code_attempt(
            student=student,
            code=code,
            request=request
        )
        
        # Get or create wallet and lock it
        wallet, _ = PaymentService.create_wallet(student)
        wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)
        
        # Create deposit transaction
        trans = Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.TransactionType.RECHARGE_CODE,
            payment_method=Transaction.PaymentMethod.RECHARGE_CODE,
            amount=recharge_code.amount,
            description=f"Recharge code: {code}",
            recharge_code=recharge_code,
            created_by=student
        )
        
        # Mark code as used
        recharge_code.is_used = True
        recharge_code.used_by = student
        recharge_code.used_at = timezone.now()
        recharge_code.save(update_fields=['is_used', 'used_by', 'used_at'])
        
        # Log the recharge
        PaymentLogService.log_recharge(
            actor=student,
            student=student,
            amount=recharge_code.amount,
            code=code,
            transaction=trans,
            request=request
        )
        
        # Send notification
        # Notification for wallet recharge is sent by the Transaction post_save signal.
        
        return trans
    
    @staticmethod
    @db_transaction.atomic
    def manual_deposit(student, amount, reason, admin, request=None):
        """Manual deposit by admin."""
        if admin.role != 'admin':
            raise ValidationError('Only admins can perform manual deposits.')
        
        if not reason:
            raise ValidationError('Reason is required for manual deposits.')
        
        # Get or create wallet and lock it (RACE CONDITION FIX)
        wallet, _ = PaymentService.create_wallet(student)
        wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)
        
        trans = Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.TransactionType.MANUAL_DEPOSIT,
            payment_method=Transaction.PaymentMethod.MANUAL,
            amount=amount,
            description=f"Manual deposit by {admin.email}",
            reason=reason,
            created_by=admin
        )
        
        # Log the manual deposit
        PaymentLogService.log_manual_deposit(
            actor=admin,
            student=student,
            amount=amount,
            transaction=trans,
            reason=reason,
            request=request
        )
        
        # Send notification
        # Notification for manual deposit is sent by the Transaction post_save signal.
        
        return trans


class BulkRechargeService:
    """Service for bulk recharge code operations."""
    
    @staticmethod
    @db_transaction.atomic
    def generate_codes(amount, count, prefix="", expires_at=None, created_by=None):
        """Generate multiple recharge codes."""
        # Validate and coerce amount
        if amount is None:
            raise ValidationError('Amount is required to generate recharge codes.')
        try:
            amount = Decimal(str(amount))
        except Exception:
            raise ValidationError('Invalid amount for recharge codes.')
        
        codes = []
        for i in range(count):
            # Generate unique code
            code = f"{prefix}{secrets.token_urlsafe(10)}"
            
            # Create recharge code
            recharge_code = RechargeCode.objects.create(
                code=code,
                amount=amount,
                expires_at=expires_at,
                created_by=created_by
            )
            codes.append(recharge_code)
        
        # Log bulk generation
        if created_by:
            PaymentLogService.log_bulk_code_generation(
                actor=created_by,
                count=count,
                amount=amount,
                codes=codes
            )
        
        return codes
    
    @staticmethod
    def export_codes_to_csv(codes):
        """Export recharge codes to CSV format."""
        import csv
        from io import StringIO
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Code', 'Amount', 'Expires At', 'Created At'])
        
        # Write data
        for code in codes:
            writer.writerow([
                code.code,
                str(code.amount),
                code.expires_at.strftime('%Y-%m-%d %H:%M:%S') if code.expires_at else '',
                code.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return output.getvalue()


class CourseStatsService:
    """Service for course statistics."""
    
    @staticmethod
    def update_course_stats(course):
        """Update statistics for a specific course."""
        stats, created = CourseStats.objects.get_or_create(course=course)
        stats.update_stats()
        return stats
    
    @staticmethod
    def update_all_stats():
        """Update statistics for all courses."""
        from courses.models import Course
        
        courses = Course.objects.filter(deleted_at__isnull=True)
        for course in courses:
            CourseStatsService.update_course_stats(course)
    
    @staticmethod
    def get_course_stats(course):
        """Get statistics for a course."""
        stats, created = CourseStats.objects.get_or_create(course=course)
        return stats
    
    @staticmethod
    def get_instructor_stats(instructor):
        """Get statistics for all courses of an instructor."""
        from courses.models import Course
        
        courses = Course.objects.filter(
            instructor=instructor,
            deleted_at__isnull=True
        )
        
        total_stats = {
            'total_courses': courses.count(),
            'total_purchases': 0,
            'total_revenue': Decimal('0.00'),
            'total_students': 0,
            'courses': []
        }
        
        student_set = set()
        
        for course in courses:
            stats = CourseStatsService.get_course_stats(course)
            total_stats['total_purchases'] += stats.total_purchases
            total_stats['total_revenue'] += stats.total_revenue
            
            # Get unique students for this course
            purchases = Purchase.objects.filter(
                course=course,
                refunded=False
            )
            for purchase in purchases:
                student_set.add(purchase.student_id)
            
            total_stats['courses'].append({
                'course_id': course.id,
                'course_title': course.title,
                'purchases': stats.total_purchases,
                'revenue': stats.total_revenue,
                'students': stats.active_students,
                'price': course.price
            })
        
        total_stats['total_students'] = len(student_set)
        return total_stats


class PriceHistoryService:
    """Service for price history management."""
    
    @staticmethod
    def record_price_change(course, old_price, new_price, changed_by, reason=""):
        """Record a price change."""
        if old_price == new_price:
            return None
        
        price_history = PriceHistory.objects.create(
            course=course,
            old_price=old_price,
            new_price=new_price,
            changed_by=changed_by,
            reason=reason
        )
        
        # Log the price change
        PaymentLogService.log_price_change(
            actor=changed_by,
            course=course,
            old_price=old_price,
            new_price=new_price,
            reason=reason
        )
        
        return price_history
    
    @staticmethod
    def get_course_price_history(course):
        """Get price history for a course."""
        return PriceHistory.objects.filter(course=course).order_by('-changed_at')


class PaymentLogService:
    """Service for payment logging."""
    
    @staticmethod
    def create_log(actor, action, **kwargs):
        """Create a payment log entry."""
        # Extract metadata and ensure JSON-serializable (convert Decimals, dates)
        metadata = kwargs.pop('metadata', {}) or {}
        safe_metadata = convert_decimals(metadata)

        # Extract known model fields from kwargs; move unknown fields into metadata
        student = kwargs.pop('student', None)
        course = kwargs.pop('course', None)
        transaction = kwargs.pop('transaction', None)
        amount = kwargs.pop('amount', None)
        ip_address = kwargs.pop('ip_address', None)
        user_agent = kwargs.pop('user_agent', None)
        session_id = kwargs.pop('session_id', None)

        # Anything left in kwargs (e.g., reason, code, etc.) should be merged into metadata
        if kwargs:
            extra_meta = convert_decimals(kwargs)
            # Merge, without overwriting existing keys
            for k, v in extra_meta.items():
                if k not in safe_metadata:
                    safe_metadata[k] = v

        # Deduplicate: avoid creating duplicate logs when services and signals
        # both attempt to log the same action within a short window.
        try:
            recent_window = timezone.now() - timedelta(seconds=5)
            dup_filter = {
                'action': action,
                'student': student,
                'course': course,
                'transaction': transaction,
                'amount': amount,
            }
            # Remove None values from filter
            dup_filter = {k: v for k, v in dup_filter.items() if v is not None}
            existing = PaymentLog.objects.filter(**dup_filter, created_at__gte=recent_window).order_by('-created_at').first()
            if existing:
                return existing
        except Exception:
            # On any error, fall back to creating the log to avoid losing records
            pass

        log = PaymentLog.objects.create(
            actor=actor,
            action=action,
            metadata=safe_metadata,
            student=student,
            course=course,
            transaction=transaction,
            amount=amount,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id
        )
        
        # Also log to file
        logger.info(
            "Payment Action: %s - Actor: %s - Student: %s - Amount: %s - IP: %s",
            action,
            (actor.email if actor else 'System'),
            (kwargs.get('student').email if kwargs.get('student') else 'N/A'),
            (str(kwargs.get('amount')) if kwargs.get('amount') is not None else 'N/A'),
            (kwargs.get('ip_address', 'N/A'))
        )
        
        return log
    
    @staticmethod
    def log_deposit(actor, student, amount, transaction=None, reason=None, request=None):
        """Log a deposit action."""
        return PaymentLogService.create_log(
            actor=actor,
            action='deposit',
            student=student,
            amount=amount,
            transaction=transaction,
            reason=reason,
            ip_address=request.META.get('REMOTE_ADDR') if request else None,
            user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
            session_id=request.session.session_key if request and request.session else None
        )
    
    @staticmethod
    def log_withdrawal(actor, student, amount, transaction=None, reason=None, request=None):
        """Log a withdrawal action."""
        return PaymentLogService.create_log(
            actor=actor,
            action='withdrawal',
            student=student,
            amount=amount,
            transaction=transaction,
            reason=reason,
            ip_address=request.META.get('REMOTE_ADDR') if request else None,
            user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
            session_id=request.session.session_key if request and request.session else None
        )
    
    @staticmethod
    def log_purchase(actor, student, course, amount, transaction=None, request=None):
        """Log a purchase action."""
        return PaymentLogService.create_log(
            actor=actor,
            action='purchase',
            student=student,
            course=course,
            amount=amount,
            transaction=transaction,
            ip_address=request.META.get('REMOTE_ADDR') if request else None,
            user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
            session_id=request.session.session_key if request and request.session else None
        )
    
    @staticmethod
    def log_refund(actor, student, course, amount, transaction=None, reason=None, request=None):
        """Log a refund action."""
        return PaymentLogService.create_log(
            actor=actor,
            action='refund',
            student=student,
            course=course,
            amount=amount,
            transaction=transaction,
            reason=reason,
            ip_address=request.META.get('REMOTE_ADDR') if request else None,
            user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
            session_id=request.session.session_key if request and request.session else None
        )
    
    @staticmethod
    def log_recharge(actor, student, amount, code, transaction=None, request=None):
        """Log a recharge code usage."""
        return PaymentLogService.create_log(
            actor=actor,
            action='recharge_code_used',
            student=student,
            amount=amount,
            transaction=transaction,
            metadata={'code': code},
            ip_address=request.META.get('REMOTE_ADDR') if request else None,
            user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
            session_id=request.session.session_key if request and request.session else None
        )
    
    @staticmethod
    def log_manual_deposit(actor, student, amount, transaction=None, reason=None, request=None):
        """Log a manual deposit."""
        return PaymentLogService.create_log(
            actor=actor,
            action='manual_deposit',
            student=student,
            amount=amount,
            transaction=transaction,
            reason=reason,
            ip_address=request.META.get('REMOTE_ADDR') if request else None,
            user_agent=request.META.get('HTTP_USER_AGENT') if request else None,
            session_id=request.session.session_key if request and request.session else None
        )
    
    @staticmethod
    def log_bulk_code_generation(actor, count, amount, codes):
        """Log bulk code generation."""
        return PaymentLogService.create_log(
            actor=actor,
            action='bulk_code_generation',
            amount=amount * count,
            metadata={
                'count': count,
                'amount_per_code': str(amount),
                'total_amount': str(amount * count),
                'sample_codes': [code.code for code in codes[:5]]
            }
        )
    
    @staticmethod
    def log_price_change(actor, course, old_price, new_price, reason=""):
        """Log a price change."""
        return PaymentLogService.create_log(
            actor=actor,
            action='price_change',
            course=course,
            amount=new_price - old_price,
            metadata={
                'old_price': str(old_price),
                'new_price': str(new_price),
                'reason': reason
            }
        )


class SuspiciousActivityService:
    """Service for detecting suspicious activities."""
    
    @staticmethod
    def check_recharge_code_attempt(student, code, request=None):
        """Check for suspicious recharge code attempts."""
        from django.utils import timezone
        from datetime import timedelta
        
        # Check multiple attempts for same code
        recent_attempts = PaymentLog.objects.filter(
            student=student,
            action='recharge_code_used',
            created_at__gte=timezone.now() - timedelta(minutes=5)
        ).count()
        
        if recent_attempts > 3:
            # Log suspicious activity
            PaymentLogService.create_log(
                actor=student,
                action='suspicious_recharge_attempts',
                student=student,
                metadata={
                    'attempt_count': recent_attempts,
                    'code_attempted': code,
                    'ip_address': request.META.get('REMOTE_ADDR') if request else None
                }
            )
            
            # Alert admin (this would typically send email or notification)
            logger.warning(
                f"Suspicious recharge attempts detected for student {student.email}. "
                f"Attempts: {recent_attempts}"
            )
    
    @staticmethod
    def check_multiple_purchases(student, request=None):
        """Check for multiple rapid purchases."""
        from django.utils import timezone
        from datetime import timedelta
        
        recent_purchases = Purchase.objects.filter(
            student=student,
            purchased_at__gte=timezone.now() - timedelta(minutes=10)
        ).count()
        
        if recent_purchases > 5:
            PaymentLogService.create_log(
                actor=student,
                action='suspicious_purchase_rate',
                student=student,
                metadata={
                    'purchase_count': recent_purchases,
                    'time_window': '10 minutes',
                    'ip_address': request.META.get('REMOTE_ADDR') if request else None
                }
            )
            
            logger.warning(
                f"High purchase rate detected for student {student.email}. "
                f"Purchases: {recent_purchases} in 10 minutes"
            )
            return True
        
        return False


class BackupService:
    """Service for financial data backup."""
    
    @staticmethod
    def create_financial_backup():
        """Create a backup of all financial data."""
        import json
        from datetime import datetime
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        def decimal_default(obj):
            """Handle Decimal serialization."""
            if isinstance(obj, Decimal):
                return str(obj)
            raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")
        
        backup_data = {
            'timestamp': timestamp,
            'wallets': list(Wallet.objects.values()),
            'transactions': list(Transaction.objects.values()),
            'purchases': list(Purchase.objects.values()),
            'recharge_codes': list(RechargeCode.objects.values()),
            'course_stats': list(CourseStats.objects.values()),
            'price_history': list(PriceHistory.objects.values())
        }
        
        # Save to file
        filename = f'financial_backup_{timestamp}.json'
        filepath = f'backups/financial/{filename}'
        
        import os
        os.makedirs('backups/financial', exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            # Use the custom default handler
            json.dump(backup_data, f, ensure_ascii=False, indent=2, default=decimal_default)
        
        # Log the backup
        logger.info(f"Financial backup created: {filename}")
        
        return filepath
    
    @staticmethod
    def export_financial_data(format='json'):
        """Export financial data in specified format."""
        if format == 'json':
            return BackupService.create_financial_backup()
        elif format == 'csv':
            # Implementation for CSV export
            pass
        elif format == 'excel':
            # Implementation for Excel export
            pass