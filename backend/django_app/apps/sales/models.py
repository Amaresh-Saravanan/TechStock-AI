import uuid
from django.db import models
from apps.authentication.models import Store
from apps.inventory.models import InventoryItem

class SaleRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='sales')
    product = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='sales_records')
    product_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    quantity = models.IntegerField()
    sold_price = models.DecimalField(max_digits=12, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    profit = models.DecimalField(max_digits=12, decimal_places=2)
    profit_margin = models.FloatField()
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    customer_phone = models.CharField(max_length=50, blank=True, null=True)
    sold_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product_name} x {self.quantity} - {self.sold_at.strftime('%Y-%m-%d')}"
