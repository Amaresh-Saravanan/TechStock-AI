from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/', include('apps.inventory.urls')),
    path('api/', include('apps.sales.urls')),
    path('api/', include('apps.price_tracker.urls')),
    path('api/', include('apps.ai_advisor.urls')),
]
