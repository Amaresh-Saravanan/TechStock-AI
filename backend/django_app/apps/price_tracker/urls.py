from django.urls import path
from .views import PriceTrackingView, PriceHistoryDetailView, PriceSuggestionsView

urlpatterns = [
    path('price-tracking/', PriceTrackingView.as_view(), name='price_tracking'),
    path('price-history/<uuid:product_id>/', PriceHistoryDetailView.as_view(), name='price_history'),
    path('price-suggestions/', PriceSuggestionsView.as_view(), name='price_suggestions'),
]
