from django.contrib import admin
from .models import Store

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'role', 'created_at')
    search_fields = ('name', 'user__username', 'user__email')
    list_filter = ('role', 'created_at')
