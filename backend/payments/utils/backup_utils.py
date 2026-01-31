"""
Utilities for backup operations.
"""
import json
import csv
from datetime import datetime
from django.db import models
from django.utils import timezone
import os


class BackupUtils:
    """Utility class for backup operations."""
    
    @staticmethod
    def export_to_json(model_class, queryset=None):
        """Export model data to JSON."""
        if queryset is None:
            queryset = model_class.objects.all()
        
        data = list(queryset.values())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        return {
            'data': data,
            'timestamp': timestamp,
            'model': model_class.__name__,
            'count': len(data)
        }
    
    @staticmethod
    def export_to_csv(model_class, queryset=None):
        """Export model data to CSV."""
        from io import StringIO
        
        if queryset is None:
            queryset = model_class.objects.all()
        
        # Get field names
        field_names = [field.name for field in model_class._meta.fields]
        
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=field_names)
        writer.writeheader()
        
        for obj in queryset:
            row = {}
            for field in field_names:
                value = getattr(obj, field)
                if isinstance(value, (datetime, timezone.datetime)):
                    row[field] = value.strftime('%Y-%m-%d %H:%M:%S')
                elif isinstance(value, models.Model):
                    row[field] = str(value.id)
                else:
                    row[field] = str(value)
            writer.writerow(row)
        
        return output.getvalue()
    
    @staticmethod
    def create_backup_summary():
        """Create a summary of all backup data."""
        from ..models import (
            Wallet, Transaction, Purchase,
            RechargeCode, CourseStats, PriceHistory
        )
        
        models_to_backup = [
            ('Wallet', Wallet),
            ('Transaction', Transaction),
            ('Purchase', Purchase),
            ('RechargeCode', RechargeCode),
            ('CourseStats', CourseStats),
            ('PriceHistory', PriceHistory),
        ]
        
        summary = {
            'timestamp': datetime.now().isoformat(),
            'models': []
        }
        
        for name, model_class in models_to_backup:
            count = model_class.objects.count()
            summary['models'].append({
                'name': name,
                'count': count,
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return summary
    
    @staticmethod
    def validate_backup_file(filepath):
        """Validate a backup file."""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            required_keys = ['timestamp', 'wallets', 'transactions', 'purchases']
            for key in required_keys:
                if key not in data:
                    return False, f"Missing required key: {key}"
            
            return True, "Backup file is valid"
            
        except json.JSONDecodeError:
            return False, "Invalid JSON format"
        except Exception as e:
            return False, f"Error validating backup: {str(e)}"
    
    @staticmethod
    def get_backup_files():
        """Get list of all backup files."""
        backup_dir = 'backups/financial/'
        if not os.path.exists(backup_dir):
            return []
        
        backup_files = []
        for filename in os.listdir(backup_dir):
            if filename.endswith('.json') and filename.startswith('financial_backup_'):
                filepath = os.path.join(backup_dir, filename)
                stat = os.stat(filepath)
                backup_files.append({
                    'filename': filename,
                    'filepath': filepath,
                    'size': stat.st_size,
                    'created': datetime.fromtimestamp(stat.st_ctime),
                    'modified': datetime.fromtimestamp(stat.st_mtime)
                })
        
        # Sort by modification time (newest first)
        backup_files.sort(key=lambda x: x['modified'], reverse=True)
        return backup_files