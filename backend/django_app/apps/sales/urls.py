from django.urls import path
from .views import RecordSaleView, SalesHistoryView, SuggestPriceView

urlpatterns = [
    path('sales/', RecordSaleView.as_view(), name='record_sale'),
    path('sales-history/', SalesHistoryView.as_view(), name='sales_history'),
    path('sales/suggest-price/<uuid:product_id>/', SuggestPriceView.as_view(), name='suggest_price'),
]
