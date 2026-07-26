from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import InventoryItem
from .serializers import InventoryItemSerializer
from apps.authentication.models import Store

class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return items for the user's store
        store = Store.objects.get(user=self.request.user)
        return InventoryItem.objects.filter(store=store).order_by('-created_at')

    def perform_create(self, serializer):
        store = Store.objects.get(user=self.request.user)
        # Calculate a basic demand score (in real app, this would use ML)
        quantity = serializer.validated_data.get('quantity', 0)
        demand_score = 80 if quantity < 10 else 50
        serializer.save(store=store, demand_score=demand_score)
