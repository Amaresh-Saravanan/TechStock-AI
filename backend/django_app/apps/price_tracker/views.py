from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import PriceHistory
from .serializers import PriceHistorySerializer
from apps.inventory.models import InventoryItem
from apps.authentication.models import Store
import random
from datetime import timedelta
from django.utils import timezone

class PriceTrackingView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store = Store.objects.get(user=request.user)
        items = InventoryItem.objects.filter(store=store)
        
        results = []
        for item in items:
            # Generate mock competitor prices for Phase 2 based on legacy behavior
            base = float(item.selling_price)
            amazon = round(base * random.uniform(0.95, 1.05), 2)
            flipkart = round(base * random.uniform(0.96, 1.08), 2)
            
            competitor_prices = [amazon, flipkart]
            market_avg = sum(competitor_prices) / len(competitor_prices)
            
            diff = base - market_avg
            if diff > (base * 0.03):
                price_status = 'Higher'
            elif diff < -(base * 0.03):
                price_status = 'Lower'
            else:
                price_status = 'Optimal'
                
            recommended = round(market_avg * 0.98, 2)

            results.append({
                "id": str(item.id),
                "name": item.name,
                "category": item.category,
                "brand": item.brand,
                "our_price": base,
                "competitor_prices": {
                    "amazon": amazon,
                    "flipkart": flipkart,
                    "mdcomputers": None,
                    "primeabgb": None
                },
                "market_avg": market_avg,
                "price_status": price_status,
                "recommended_price": recommended,
                "potential_margin": float((recommended - float(item.purchase_price)) / float(item.purchase_price)) * 100 if float(item.purchase_price) > 0 else 0
            })
            
        return Response(results)

class PriceHistoryDetailView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        try:
            store = Store.objects.get(user=request.user)
            item = InventoryItem.objects.get(id=product_id, store=store)
            
            history = PriceHistory.objects.filter(product=item).order_by('recorded_at')
            if not history.exists():
                # Mock some history if none exists for the demo
                data = []
                now = timezone.now()
                base = float(item.selling_price)
                for i in range(30, -1, -5):
                    date = now - timedelta(days=i)
                    data.append({
                        "date": date.strftime('%Y-%m-%d'),
                        "our_price": base,
                        "amazon": round(base * random.uniform(0.95, 1.05), 2),
                        "flipkart": round(base * random.uniform(0.96, 1.08), 2),
                        "mdcomputers": None,
                        "primeabgb": None
                    })
                return Response(data)
                
            return Response([{
                "date": h.recorded_at.strftime('%Y-%m-%d'),
                "our_price": float(h.our_price),
                "amazon": float(h.amazon_price) if h.amazon_price else None,
                "flipkart": float(h.flipkart_price) if h.flipkart_price else None,
                "mdcomputers": float(h.mdcomputers_price) if h.mdcomputers_price else None,
                "primeabgb": float(h.primeabgb_price) if h.primeabgb_price else None
            } for h in history])
            
        except InventoryItem.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

class PriceSuggestionsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response([]) # Stub for now
