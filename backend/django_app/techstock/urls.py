from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def health_check(request):
    return HttpResponse("TechStock-AI Backend API is running successfully. All API routes are under /api/")

urlpatterns = [
    path('', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/', include('apps.inventory.urls')),
    path('api/', include('apps.sales.urls')),
    path('api/', include('apps.price_tracker.urls')),
    path('api/', include('apps.ai_advisor.urls')),
]
