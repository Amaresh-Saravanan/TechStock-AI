from rest_framework import serializers
from .models import PriceHistory

class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = '__all__'
        read_only_fields = ['id', 'recorded_at']
