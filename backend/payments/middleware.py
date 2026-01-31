"""
Middleware for handling Decimal serialization in responses.
"""
import json
from decimal import Decimal
from django.utils.deprecation import MiddlewareMixin
from collections.abc import Mapping, Iterable


class DecimalJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles Decimal objects."""
    
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return super().default(obj)


class DecimalSerializationMiddleware(MiddlewareMixin):
    """Middleware to handle Decimal serialization in DRF responses."""
    
    def process_response(self, request, response):
        # Only process responses with .data (DRF Response)
        if hasattr(response, 'data'):
            response.data = self.convert_decimals(response.data)
        return response
    
    def convert_decimals(self, obj):
        """Recursively convert Decimal objects to strings."""
        if isinstance(obj, Decimal):
            return str(obj)
        elif isinstance(obj, Mapping):  # Handles dict, OrderedDict, ReturnDict
            return {k: self.convert_decimals(v) for k, v in obj.items()}
        elif isinstance(obj, Iterable) and not isinstance(obj, (str, bytes)):
            # Handles list, tuple, ReturnList, etc.
            return [self.convert_decimals(item) for item in obj]
        else:
            return obj