"""
Django management command for financial backup.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from payments.services import BackupService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create a backup of financial data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--automatic',
            action='store_true',
            help='Automatic backup (for cron jobs)'
        )
        parser.add_argument(
            '--output',
            type=str,
            help='Output directory for backup file'
        )
        parser.add_argument(
            '--retention-days',
            type=int,
            default=30,
            help='Delete backups older than X days (default: 30)'
        )
    
    def handle(self, *args, **options):
        self.stdout.write('Creating financial backup...')
        
        try:
            # Create backup
            backup_file = BackupService.create_financial_backup()
            
            self.stdout.write(
                self.style.SUCCESS(f'✓ Backup created successfully: {backup_file}')
            )
            
            # Clean old backups if retention days specified
            if options['retention_days']:
                self.clean_old_backups(options['retention_days'])
            
            if options['automatic']:
                logger.info(f'Automatic backup created: {backup_file}')
            
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'✗ Error creating backup: {str(e)}'))
            logger.error(f'Backup failed: {str(e)}')
    
    def clean_old_backups(self, retention_days):
        """Delete backups older than retention_days."""
        import os
        import glob
        from datetime import datetime, timedelta
        
        backup_dir = 'backups/financial/'
        if not os.path.exists(backup_dir):
            return
        
        cutoff_date = datetime.now() - timedelta(days=retention_days)
        
        for backup_file in glob.glob(os.path.join(backup_dir, 'financial_backup_*.json')):
            try:
                # Extract timestamp from filename
                filename = os.path.basename(backup_file)
                # Format: financial_backup_YYYYMMDD_HHMMSS.json
                timestamp_str = filename.replace('financial_backup_', '').replace('.json', '')
                file_date = datetime.strptime(timestamp_str, '%Y%m%d_%H%M%S')
                
                if file_date < cutoff_date:
                    os.remove(backup_file)
                    self.stdout.write(f'  Deleted old backup: {filename}')
                    logger.info(f'Deleted old backup: {filename}')
            except Exception as e:
                self.stderr.write(f'  Error processing {backup_file}: {str(e)}')