from rest_framework.renderers import JSONRenderer
from django.core.serializers.json import DjangoJSONEncoder
import json


class DecimalJSONRenderer(JSONRenderer):
    """JSON renderer that uses DjangoJSONEncoder to handle Decimal and other types."""

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if data is None:
            return super().render(data, accepted_media_type, renderer_context)
        # Use DjangoJSONEncoder to handle Decimal, QuerySets etc.
        return json.dumps(data, cls=DjangoJSONEncoder, ensure_ascii=False).encode('utf-8')
