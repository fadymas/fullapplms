"""
Django management command for generating recharge codes.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from payments.services import BulkRechargeService
import logging
import os

User = get_user_model()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Generate recharge codes in bulk'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--amount',
            type=float,
            required=True,
            help='Amount for each recharge code'
        )
        parser.add_argument(
            '--count',
            type=int,
            required=True,
            help='Number of codes to generate'
        )
        parser.add_argument(
            '--prefix',
            type=str,
            default='',
            help='Prefix for codes (optional)'
        )
        parser.add_argument(
            '--admin-id',
            type=int,
            required=True,
            help='ID of admin user creating the codes'
        )
        parser.add_argument(
            '--output',
            type=str,
            help='Output file for codes (optional)'
        )
        parser.add_argument(
            '--expires-in',
            type=int,
            help='Code expires in X days from now'
        )
        parser.add_argument(
            '--format',
            type=str,
            choices=['csv', 'txt', 'json'],
            default='csv',
            help='Output format'
        )
    
    def handle(self, *args, **options):
        amount = options['amount']
        count = options['count']
        prefix = options['prefix']
        admin_id = options['admin_id']
        expires_in = options['expires_in']
        output_format = options['format']
        
        self.stdout.write(f'Generating {count} recharge codes of {amount} each...')
        
        try:
            # Get admin user
            admin_user = User.objects.get(id=admin_id, role='admin')
            
            # Calculate expires_at if provided
            expires_at = None
            if expires_in:
                from django.utils import timezone
                expires_at = timezone.now() + timezone.timedelta(days=expires_in)
            
            # Generate codes
            codes = BulkRechargeService.generate_codes(
                amount=amount,
                count=count,
                prefix=prefix,
                expires_at=expires_at,
                created_by=admin_user
            )
            
            self.stdout.write(self.style.SUCCESS(f'✓ Generated {len(codes)} codes'))
            
            # Save to file if output specified
            if options['output']:
                self.save_codes(codes, options['output'], output_format)
            else:
                # Print sample codes
                self.print_sample_codes(codes)
            
            logger.info(
                f'Generated {count} recharge codes by admin {admin_user.email}'
            )
            
        except User.DoesNotExist:
            self.stderr.write(self.style.ERROR('✗ Admin user not found'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'✗ Error generating codes: {str(e)}'))
            logger.error(f'Code generation failed: {str(e)}')
    
    def save_codes(self, codes, output_file, output_format):
        """Save codes to file in specified format."""
        if output_format == 'csv':
            csv_data = BulkRechargeService.export_codes_to_csv(codes)
            with open(output_file, 'w') as f:
                f.write(csv_data)
        
        elif output_format == 'txt':
            with open(output_file, 'w') as f:
                f.write('Recharge Codes:\n')
                f.write('=' * 50 + '\n')
                for code in codes:
                    expires_info = f" (Expires: {code.expires_at})" if code.expires_at else ""
                    f.write(f"{code.code}: {code.amount}{expires_info}\n")
        
        elif output_format == 'json':
            import json
            data = [{'code': code.code, 'amount': str(code.amount)} for code in codes]
            with open(output_file, 'w') as f:
                json.dump(data, f, indent=2)
        
        self.stdout.write(f'✓ Codes saved to {output_file} ({output_format.upper()})')
    
    def print_sample_codes(self, codes):
        """Print first 5 codes as sample."""
        self.stdout.write('\nSample codes (first 5):')
        self.stdout.write('-' * 50)
        for i, code in enumerate(codes[:5], 1):
            expires_info = f" | Expires: {code.expires_at}" if code.expires_at else ""
            self.stdout.write(f"{i}. {code.code}: {code.amount}{expires_info}")
        
        if len(codes) > 5:
            self.stdout.write(f'... and {len(codes) - 5} more codes')