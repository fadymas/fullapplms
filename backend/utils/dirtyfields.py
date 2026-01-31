"""Utility mixin to track dirty fields for Django models.

This small helper avoids adding an external dependency while providing the
`get_dirty_fields()` API used in several signal handlers.
"""
from __future__ import annotations

from typing import Dict


class DirtyFieldsMixin:
    """Track original field values and report changed fields.

    Works by recording field values at initialization and refreshing after save.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        try:
            self._original_state = {f.name: getattr(self, f.name) for f in self._meta.fields}
        except Exception:
            self._original_state = {}

    def get_dirty_fields(self) -> Dict[str, Dict[str, object]]:
        dirty = {}
        for f in getattr(self, '_meta').fields:
            name = f.name
            old = self._original_state.get(name, None)
            new = getattr(self, name)
            if old != new:
                dirty[name] = {'old': old, 'new': new}
        return dirty

    def save(self, *args, **kwargs):
        result = super().save(*args, **kwargs)
        try:
            self._original_state = {f.name: getattr(self, f.name) for f in self._meta.fields}
        except Exception:
            self._original_state = {}
        return result
