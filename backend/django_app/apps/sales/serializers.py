from rest_framework import serializers
from .models import SaleRecord

class SaleRecordSerializer(serializers.ModelSerializer):
    product_id = serializers.UUIDField(source='product.id', read_only=True)

    class Meta:
        model = SaleRecord
        fields = '__all__'
        read_only_fields = ['id', 'store', 'product_name', 'category', 'brand', 'purchase_price', 'profit', 'profit_margin', 'sold_at']

class RecordSalePayloadSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    sold_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    customer_name = serializers.CharField(required=False, allow_blank=True)
    customer_phone = serializers.CharField(required=False, allow_blank=True)
