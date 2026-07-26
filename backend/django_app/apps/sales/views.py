from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, F
from django.db import transaction
from .models import SaleRecord
from .serializers import SaleRecordSerializer, RecordSalePayloadSerializer
from apps.inventory.models import InventoryItem
from apps.authentication.models import Store
from django.utils import timezone
import random

class RecordSaleView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RecordSalePayloadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        store = Store.objects.get(user=request.user)

        try:
            with transaction.atomic():
                product = InventoryItem.objects.select_for_update().get(id=data['product_id'], store=store)
                
                if product.quantity < data['quantity']:
                    return Response({"detail": "Insufficient stock."}, status=status.HTTP_400_BAD_REQUEST)
                
                # Update inventory
                product.quantity -= data['quantity']
                product.total_sold += data['quantity']
                product.last_sold_days = 0
                product.save()

                # Calculate profit
                profit = (data['sold_price'] - product.purchase_price) * data['quantity']
                profit_margin = float(profit) / float(product.purchase_price * data['quantity']) if product.purchase_price > 0 else 1.0

                # Create sale record
                sale = SaleRecord.objects.create(
                    store=store,
                    product=product,
                    product_name=product.name,
                    category=product.category,
                    brand=product.brand,
                    quantity=data['quantity'],
                    sold_price=data['sold_price'],
                    purchase_price=product.purchase_price,
                    profit=profit,
                    profit_margin=profit_margin,
                    customer_name=data.get('customer_name', ''),
                    customer_phone=data.get('customer_phone', '')
                )
                
                return Response(SaleRecordSerializer(sale).data, status=status.HTTP_201_CREATED)
        except InventoryItem.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SalesHistoryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store = Store.objects.get(user=request.user)
        sales = SaleRecord.objects.filter(store=store).order_by('-sold_at')
        
        total_revenue = sales.aggregate(total=Sum(F('sold_price') * F('quantity')))['total'] or 0
        total_profit = sales.aggregate(total=Sum('profit'))['total'] or 0
        
        avg_margin = float(total_profit) / float(total_revenue - total_profit) if (total_revenue - total_profit) > 0 else 0

        # Note: A real app would aggregate this using Django ORM grouped by month
        # Keeping it simple to match the TDD response interface
        return Response({
            "sales": SaleRecordSerializer(sales[:50], many=True).data, # limit to 50 for now
            "total_revenue": float(total_revenue),
            "total_profit": float(total_profit),
            "avg_margin": avg_margin,
            "monthly_revenue": [], # Simplified for this demo
            "category_breakdown": [], # Simplified for this demo
            "top_sellers": [] # Simplified for this demo
        })

class SuggestPriceView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        try:
            store = Store.objects.get(user=request.user)
            product = InventoryItem.objects.get(id=product_id, store=store)
            
            # Mock price suggestion based on purchase price
            base = float(product.purchase_price)
            suggested = round(base * 1.15, 2)  # 15% markup
            competitor_avg = round(base * random.uniform(1.10, 1.20), 2)
            
            return Response({
                "suggested_price": suggested,
                "competitor_avg": competitor_avg,
                "margin_at_suggested": round((suggested - base) / base * 100, 1) if base > 0 else 0,
                "reasoning": f"Based on purchase price of ₹{base}, a 15% markup gives competitive margin."
            })
        except InventoryItem.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
