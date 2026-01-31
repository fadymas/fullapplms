import os, sys, traceback
# ensure project root is on sys.path so package imports work
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_backend.settings')
import django
django.setup()
from django.test import RequestFactory
from django.conf import settings

try:
    # import the schema_view from the urls module
    from lms_backend import urls as project_urls
    schema_view = project_urls.schema_view
    # create a GET request for the openapi JSON
    rf = RequestFactory()
    request = rf.get('/swagger/?format=openapi')
    # set host/scheme and a safe fake user so schema generation won't hit DB filters
    request.META['HTTP_HOST'] = '127.0.0.1'
    request.META['wsgi.url_scheme'] = 'http'

    class _FakeUser:
        def __init__(self):
            self.role = 'admin'
            self.is_authenticated = True
            self.pk = 1
        def __int__(self):
            return 1

    request.user = _FakeUser()
    # call the view (without UI) to get the schema
    view = schema_view.without_ui(cache_timeout=0)
    response = view(request)
    # If it's a Django HttpResponse or DRF Response, print status and content
    print('Status:', getattr(response, 'status_code', 'N/A'))
    # render template responses before accessing content
    if hasattr(response, 'render'):
        response.render()
    content = getattr(response, 'content', None)
    if content:
        print(content[:1000])
    else:
        print('No content returned')
except Exception:
    traceback.print_exc()
    sys.exit(1)
