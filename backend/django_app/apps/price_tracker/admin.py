from django.contrib import admin
from .models import PriceHistory

@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'our_price', 'amazon_price', 'flipkart_price', 'recorded_at')
    search_fields = ('product__name', 'product__store__name')
    list_filter = ('recorded_at', 'product__store')
