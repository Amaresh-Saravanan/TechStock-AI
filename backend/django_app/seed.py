import os
import django
import uuid
import random
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'techstock.settings')
django.setup()

from django.contrib.auth.models import User
from apps.authentication.models import Store
from apps.inventory.models import InventoryItem
from apps.sales.models import SaleRecord

# Legacy mock data from app.py
MOCK_PRODUCTS = [
    {"name": "AMD Ryzen 9 7950X", "category": "CPU", "brand": "AMD", "purchase": 45000, "selling": 52000, "qty": 12, "last_sold": 2},
    {"name": "Intel Core i9-14900K", "category": "CPU", "brand": "Intel", "purchase": 48000, "selling": 55000, "qty": 8, "last_sold": 5},
    {"name": "NVIDIA RTX 4090 24GB", "category": "GPU", "brand": "NVIDIA", "purchase": 140000, "selling": 165000, "qty": 3, "last_sold": 12},
    {"name": "AMD Radeon RX 7900 XTX", "category": "GPU", "brand": "AMD", "purchase": 85000, "selling": 98000, "qty": 5, "last_sold": 4},
    {"name": "ASUS ROG Crosshair X670E", "category": "Motherboard", "brand": "ASUS", "purchase": 42000, "selling": 48000, "qty": 0, "last_sold": 25},
    {"name": "G.Skill Trident Z5 64GB DDR5", "category": "RAM", "brand": "G.Skill", "purchase": 18000, "selling": 22000, "qty": 15, "last_sold": 1},
    {"name": "Samsung 990 Pro 2TB NVMe", "category": "Storage", "brand": "Samsung", "purchase": 14000, "selling": 17500, "qty": 20, "last_sold": 3},
    {"name": "Corsair RM1000x 1000W PSU", "category": "Power Supply", "brand": "Corsair", "purchase": 16000, "selling": 19000, "qty": 10, "last_sold": 8},
    {"name": "Lian Li O11 Dynamic EVO", "category": "Case", "brand": "Lian Li", "purchase": 13000, "selling": 16000, "qty": 7, "last_sold": 15},
    {"name": "Noctua NH-D15 Cooler", "category": "Cooling", "brand": "Noctua", "purchase": 8500, "selling": 10500, "qty": 2, "last_sold": 65},
]

def seed():
    print("Seeding database...")
    
    # 1. Create a default User and Store
    user, created = User.objects.get_or_create(
        username="admin@techstock.ai",
        defaults={
            "email": "admin@techstock.ai",
            "first_name": "Admin",
        }
    )
    if created:
        user.set_password("admin123")
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print("Created superuser admin@techstock.ai / admin123")
    
    store, created = Store.objects.get_or_create(
        user=user,
        defaults={
            "name": "TechStock Main Hub",
            "role": "admin"
        }
    )

    # 2. Seed Inventory
    if InventoryItem.objects.filter(store=store).exists():
        print("Inventory already exists. Skipping...")
    else:
        for p in MOCK_PRODUCTS:
            InventoryItem.objects.create(
                store=store,
                name=p["name"],
                category=p["category"],
                brand=p["brand"],
                purchase_price=Decimal(str(p["purchase"])),
                selling_price=Decimal(str(p["selling"])),
                quantity=p["qty"],
                last_sold_days=p["last_sold"],
                demand_score=random.randint(40, 95),
                total_sold=random.randint(5, 50)
            )
        print("Seeded 10 inventory items.")

    # 3. Seed Sales
    if SaleRecord.objects.filter(store=store).exists():
        print("Sales already exist. Skipping...")
    else:
        items = list(InventoryItem.objects.filter(store=store))
        now = timezone.now()
        for i in range(15):
            item = random.choice(items)
            qty = random.randint(1, 3)
            profit = (item.selling_price - item.purchase_price) * qty
            
            record = SaleRecord.objects.create(
                store=store,
                product=item,
                product_name=item.name,
                category=item.category,
                brand=item.brand,
                quantity=qty,
                sold_price=item.selling_price,
                purchase_price=item.purchase_price,
                profit=profit,
                profit_margin=float(profit / (item.purchase_price * qty)) if item.purchase_price else 1.0
            )
            # Make the sale date in the past
            record.sold_at = now - timedelta(days=random.randint(0, 30))
            record.save()
        print("Seeded 15 sales records.")

    print("Done!")

if __name__ == "__main__":
    seed()
