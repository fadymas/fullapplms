from decimal import Decimal
from datetime import date, datetime
from collections.abc import Mapping, Iterable


def _convert(obj):
    """Recursively convert Decimals to strings and datetimes to ISO strings.

    Handles dict, list, tuple, set, and objects with __dict__ by recursing.
    Does NOT convert floats.
    """
    try:
        if obj is None:
            return None
        if isinstance(obj, Decimal):
            return str(obj)
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Mapping):
            return {k: _convert(v) for k, v in obj.items()}
        if isinstance(obj, (list, tuple, set)):
            converted = [_convert(v) for v in obj]
            return type(obj)(converted) if not isinstance(obj, list) else converted
        # Fallback for objects with __dict__ (models, simple objects)
        if hasattr(obj, "__dict__"):
            return _convert(obj.__dict__)
        return obj
    except Exception:
        # Conservative fallback: string representation
        return str(obj)


def convert_decimals(obj):
    """Public helper to convert Decimal/date/datetime in structures to safe JSON types.

    Usage:
        from utils.safe_serialize import convert_decimals
        safe = convert_decimals(payload)

    Intended use only in Signals, Background tasks (Celery), Webhooks, and Logging.
    Do NOT use this in normal DRF Views that should return `serializer.data`.
    """
    return _convert(obj)
