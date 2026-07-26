from django.contrib import admin
from .models import SaleRecord

@admin.register(SaleRecord)
class SaleRecordAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'store', 'quantity', 'sold_price', 'profit', 'sold_at')
    search_fields = ('product_name', 'store__name', 'customer_name', 'customer_phone')
    list_filter = ('category', 'brand', 'store', 'sold_at')
