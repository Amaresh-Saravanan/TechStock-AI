from django.urls import path
from .views import RecordSaleView, SalesHistoryView

urlpatterns = [
    path('sales/', RecordSaleView.as_view(), name='record_sale'),
    path('sales-history/', SalesHistoryView.as_view(), name='sales_history'),
]
