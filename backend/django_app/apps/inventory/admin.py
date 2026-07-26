from django.contrib import admin
from .models import InventoryItem

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'store', 'category', 'brand', 'quantity', 'selling_price', 'demand_score')
    search_fields = ('name', 'store__name', 'category', 'brand')
    list_filter = ('category', 'brand', 'store')
