from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Store
from django.contrib.auth.password_validation import validate_password

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ['id', 'name', 'role', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_id = serializers.CharField(source='store.id', read_only=True)
    role = serializers.CharField(source='store.role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'store_name', 'store_id', 'role']

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    store_name = serializers.CharField(max_length=255)
    role = serializers.CharField(max_length=50)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['name']
        )
        Store.objects.create(
            user=user,
            name=validated_data['store_name'],
            role=validated_data['role']
        )
        return user
