import uuid
from django.db import models
from apps.inventory.models import InventoryItem

class PriceHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='price_history')
    our_price = models.DecimalField(max_digits=12, decimal_places=2)
    amazon_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    flipkart_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    mdcomputers_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    primeabgb_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} prices on {self.recorded_at.strftime('%Y-%m-%d')}"
