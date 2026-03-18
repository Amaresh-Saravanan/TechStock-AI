import os
import random
import json
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from loguru import logger
from pydantic import BaseModel, ValidationError
import jwt
from werkzeug.security import generate_password_hash, check_password_hash

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

# Load env file if python-dotenv is installed
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Initialize Loguru
logger.add("backend/logs/app.log", rotation="500 MB", level="INFO", enqueue=True)

# Gemini AI Setup
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        GEMINI_AVAILABLE = True
    else:
        GEMINI_AVAILABLE = False
        gemini_model = None
except ImportError:
    GEMINI_AVAILABLE = False
    gemini_model = None

app = Flask(__name__)

# Basic Config
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-prod-123')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-key-change-in-prod-123')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///techstock.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Restrict CORS origins
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
CORS(app, supports_credentials=True, origins=[FRONTEND_URL, "http://127.0.0.1:5173"])

# Setup Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["1000 per day", "200 per hour"],
    storage_uri="memory://"
)

# Setup SQLAlchemy
db = SQLAlchemy(app)

# ============== DATABASE MODELS ==============
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default='retailer')
    store_name = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "storeName": self.store_name
        }

class InventoryItem(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    brand = db.Column(db.String(50), nullable=False)
    purchasePrice = db.Column(db.Float, nullable=False)
    sellingPrice = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    lastSoldDays = db.Column(db.Integer, nullable=False, default=0)
    demandScore = db.Column(db.Integer, nullable=False, default=50)
    totalSold = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "category": self.category,
            "brand": self.brand, "purchasePrice": self.purchasePrice,
            "sellingPrice": self.sellingPrice, "quantity": self.quantity,
            "lastSoldDays": self.lastSoldDays, "demandScore": self.demandScore,
            "totalSold": self.totalSold
        }

class SaleRecordModel(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    productId = db.Column(db.String(50), nullable=False)
    productName = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    brand = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    soldPrice = db.Column(db.Float, nullable=False)
    purchasePrice = db.Column(db.Float, nullable=False)
    profit = db.Column(db.Float, nullable=False)
    profitMargin = db.Column(db.Float, nullable=False)
    customerName = db.Column(db.String(150), nullable=True)
    customerPhone = db.Column(db.String(50), nullable=True)
    soldAt = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "productId": self.productId, "productName": self.productName,
            "category": self.category, "brand": self.brand, "quantity": self.quantity,
            "soldPrice": self.soldPrice, "purchasePrice": self.purchasePrice,
            "profit": self.profit, "profitMargin": self.profitMargin,
            "customerName": self.customerName, "customerPhone": self.customerPhone,
            "soldAt": self.soldAt
        }

with app.app_context():
    db.create_all()

# ============== PYDANTIC SCHEMAS ==============
class RegisterSchema(BaseModel):
    name: str
    email: str
    password: str
    storeName: str
    role: str

class LoginSchema(BaseModel):
    email: str
    password: str

# JWT Helper functions
def generate_token(user_id):
    payload = {
        'exp': datetime.now(timezone.utc) + timedelta(days=1),
        'iat': datetime.now(timezone.utc),
        'sub': user_id
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

def get_current_user_from_cookie():
    token = request.cookies.get('auth_token')
    if not token:
        return None
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(payload['sub'])
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# ============== MOCK DATA STORE ==============

INVENTORY_DATA = [
    {"id": "1", "name": "AMD Ryzen 7 7800X3D", "category": "CPU", "brand": "AMD", "purchasePrice": 28500, "sellingPrice": 34999, "quantity": 12, "lastSoldDays": 5, "demandScore": 92, "totalSold": 8},
    {"id": "2", "name": "NVIDIA RTX 4070 Ti Super", "category": "GPU", "brand": "NVIDIA", "purchasePrice": 52000, "sellingPrice": 64999, "quantity": 5, "lastSoldDays": 3, "demandScore": 95, "totalSold": 15},
    {"id": "3", "name": "Corsair Vengeance DDR5 32GB", "category": "RAM", "brand": "Corsair", "purchasePrice": 7200, "sellingPrice": 8999, "quantity": 25, "lastSoldDays": 1, "demandScore": 88, "totalSold": 35},
    {"id": "4", "name": "Samsung 990 Pro 2TB", "category": "SSD", "brand": "Samsung", "purchasePrice": 11500, "sellingPrice": 14499, "quantity": 18, "lastSoldDays": 6, "demandScore": 75, "totalSold": 12},
    {"id": "5", "name": "Intel Core i9-14900K", "category": "CPU", "brand": "Intel", "purchasePrice": 42000, "sellingPrice": 49999, "quantity": 3, "lastSoldDays": 20, "demandScore": 68, "totalSold": 7},
    {"id": "6", "name": "AMD RX 7900 XTX", "category": "GPU", "brand": "AMD", "purchasePrice": 65000, "sellingPrice": 79999, "quantity": 2, "lastSoldDays": 130, "demandScore": 25, "totalSold": 0},
    {"id": "7", "name": "WD Blue 1TB HDD", "category": "HDD", "brand": "Western Digital", "purchasePrice": 2800, "sellingPrice": 3499, "quantity": 40, "lastSoldDays": 90, "demandScore": 15, "totalSold": 5},
    {"id": "8", "name": "ASUS ROG Strix B650E-F", "category": "Motherboard", "brand": "ASUS", "purchasePrice": 18500, "sellingPrice": 22999, "quantity": 8, "lastSoldDays": 4, "demandScore": 82, "totalSold": 12},
    {"id": "9", "name": "Corsair RM850x", "category": "PSU", "brand": "Corsair", "purchasePrice": 8500, "sellingPrice": 10499, "quantity": 15, "lastSoldDays": 2, "demandScore": 78, "totalSold": 18},
    {"id": "10", "name": "NVIDIA RTX 4060", "category": "GPU", "brand": "NVIDIA", "purchasePrice": 24000, "sellingPrice": 29999, "quantity": 20, "lastSoldDays": 1, "demandScore": 90, "totalSold": 25},
]

SALES_HISTORY = [
    {
        "id": "sale-1", "productId": "1", "productName": "AMD Ryzen 7 7800X3D", "category": "CPU",
        "brand": "AMD", "quantity": 1, "soldPrice": 34999, "purchasePrice": 28500,
        "profit": 6499, "profitMargin": 22.8, "customerName": "Rahul Sharma",
        "customerPhone": "9876543210", "soldAt": (datetime.now() - timedelta(days=2)).isoformat()
    },
    {
        "id": "sale-2", "productId": "2", "productName": "NVIDIA RTX 4070 Ti Super", "category": "GPU",
        "brand": "NVIDIA", "quantity": 2, "soldPrice": 64500, "purchasePrice": 52000,
        "profit": 25000, "profitMargin": 24.0, "customerName": "Priya Patel",
        "customerPhone": "9876543211", "soldAt": (datetime.now() - timedelta(days=1)).isoformat()
    }
]

def sync_db_and_memory():
    global INVENTORY_DATA, SALES_HISTORY
    with app.app_context():
        if InventoryItem.query.count() == 0:
            for item in INVENTORY_DATA:
                db.session.add(InventoryItem(**item))
            db.session.commit()
        else:
            INVENTORY_DATA = [item.to_dict() for item in InventoryItem.query.all()]
            
        if SaleRecordModel.query.count() == 0:
            for sale in SALES_HISTORY:
                db.session.add(SaleRecordModel(**sale))
            db.session.commit()
        else:
            SALES_HISTORY = [sale.to_dict() for sale in SaleRecordModel.query.all()]

sync_db_and_memory()

PRICE_HISTORY = {
    "1": [36000, 35500, 35200, 34800, 34999, 34500],  # AMD Ryzen 7 7800X3D
    "2": [68000, 66500, 65800, 65200, 64999, 64500],  # RTX 4070 Ti Super
    "10": [32000, 31000, 30500, 30200, 29999, 29500], # RTX 4060
}

COMPETITOR_PRICES = {
    "1": {"amazon": 33499, "flipkart": 34299, "mdcomputers": 33999},
    "2": {"amazon": 63999, "flipkart": 65499, "mdcomputers": 62999},
    "10": {"amazon": 28999, "flipkart": 29499, "mdcomputers": 28499},
}

# ============== ML MODELS ==============

class PricePredictionModel:
    """Simple price prediction using polynomial regression"""
    
    def predict_price(self, product_id: str, months_ahead: int = 3):
        if product_id not in PRICE_HISTORY:
            return None
        
        prices = PRICE_HISTORY[product_id]
        X = np.array(range(len(prices))).reshape(-1, 1)
        y = np.array(prices)
        
        # Polynomial regression for better curve fitting
        poly = PolynomialFeatures(degree=2)
        X_poly = poly.fit_transform(X)
        
        model = LinearRegression()
        model.fit(X_poly, y)
        
        # Predict future prices
        future_X = np.array(range(len(prices), len(prices) + months_ahead)).reshape(-1, 1)
        future_X_poly = poly.transform(future_X)
        predictions = model.predict(future_X_poly)
        
        # Add some realistic noise
        predictions = [max(p + random.uniform(-500, 500), prices[-1] * 0.7) for p in predictions]
        
        return {
            "historical": prices,
            "predicted": [round(p) for p in predictions],
            "trend": "decreasing" if predictions[-1] < prices[-1] else "increasing",
            "confidence": round(random.uniform(75, 95), 1)
        }

class DemandForecastModel:
    """Demand forecasting based on multiple factors"""
    
    def calculate_demand_score(self, item: dict) -> dict:
        base_score = item["demandScore"]
        
        # Adjust based on days since last sale
        if item["lastSoldDays"] <= 3:
            recency_factor = 1.1
        elif item["lastSoldDays"] <= 7:
            recency_factor = 1.0
        elif item["lastSoldDays"] <= 30:
            recency_factor = 0.8
        else:
            recency_factor = 0.5
        
        # Adjust based on quantity (scarcity drives demand perception)
        if item["quantity"] <= 3:
            scarcity_factor = 1.15
        elif item["quantity"] <= 10:
            scarcity_factor = 1.05
        else:
            scarcity_factor = 1.0
        
        # Category trends (GPUs and CPUs are hot right now)
        category_boost = {
            "GPU": 1.15,
            "CPU": 1.10,
            "RAM": 1.05,
            "SSD": 1.0,
            "Motherboard": 0.95,
            "PSU": 0.9,
            "HDD": 0.7
        }
        
        final_score = min(100, base_score * recency_factor * scarcity_factor * category_boost.get(item["category"], 1.0))
        
        return {
            "score": round(final_score),
            "level": "Peak" if final_score >= 85 else "High" if final_score >= 65 else "Medium" if final_score >= 40 else "Low",
            "trend": "rising" if recency_factor > 1 else "stable" if recency_factor == 1 else "declining"
        }

class RecommendationEngine:
    """AI-powered recommendation engine"""
    
    def __init__(self):
        self.price_model = PricePredictionModel()
        self.demand_model = DemandForecastModel()
    
    def get_top_recommendation(self) -> dict:
        """Get the single best recommendation for the AI Insight card"""
        best_item = None
        best_score = 0
        
        for item in INVENTORY_DATA:
            demand = self.demand_model.calculate_demand_score(item)
            profit_margin = (item["sellingPrice"] - item["purchasePrice"]) / item["purchasePrice"] * 100
            
            # Score based on demand + profit potential + scarcity
            opportunity_score = (
                demand["score"] * 0.4 +
                profit_margin * 0.4 +
                (100 - min(item["quantity"], 100)) * 0.2
            )
            
            if opportunity_score > best_score and item["quantity"] > 0:
                best_score = opportunity_score
                best_item = item
                best_demand = demand
        
        if not best_item:
            return None
        
        profit = best_item["sellingPrice"] - best_item["purchasePrice"]
        
        return {
            "product": best_item["name"],
            "productId": best_item["id"],
            "profit": profit,
            "profitFormatted": f"+₹{profit:,}",
            "demandLevel": best_demand["level"],
            "supplyLevel": "Critical" if best_item["quantity"] <= 5 else "Low" if best_item["quantity"] <= 10 else "Adequate",
            "confidenceScore": round(random.uniform(85, 98), 1),
            "insight": self._generate_insight(best_item, best_demand),
            "surgePct": round(random.uniform(30, 60))
        }
    
    def _generate_insight(self, item: dict, demand: dict) -> str:
        templates = [
            f"Market intelligence indicates a {{surge}}% surge in demand. Current valuation is {round((item['sellingPrice'] - item['purchasePrice']) / item['purchasePrice'] * 100)}% above acquisition cost.",
            f"High-velocity item with {demand['score']}% demand score. Inventory reaching critical levels across regional distributors.",
            f"Premium segment showing exceptional performance. Recommend maintaining stock levels for Q1 demand cycle."
        ]
        return random.choice(templates)
    
    def get_all_recommendations(self) -> list:
        """Get prioritized list of recommendations"""
        recommendations = []
        
        for item in INVENTORY_DATA:
            demand = self.demand_model.calculate_demand_score(item)
            profit_margin = (item["sellingPrice"] - item["purchasePrice"]) / item["purchasePrice"] * 100
            
            # Dead stock alert
            if item["lastSoldDays"] > 60:
                recommendations.append({
                    "productId": item["id"],
                    "product": item["name"],
                    "action": "Discount 15%",
                    "reason": f"Unsold for {item['lastSoldDays']}+ days. Consider clearance.",
                    "priority": "high",
                    "type": "dead_stock"
                })
            
            # Low stock + high demand
            elif item["quantity"] <= 5 and demand["score"] >= 70:
                recommendations.append({
                    "productId": item["id"],
                    "product": item["name"],
                    "action": "Restock Urgently",
                    "reason": f"Only {item['quantity']} units left with {demand['level']} demand.",
                    "priority": "high",
                    "type": "restock"
                })
            
            # High demand opportunity
            elif demand["score"] >= 85:
                recommendations.append({
                    "productId": item["id"],
                    "product": item["name"],
                    "action": "Increase Stock",
                    "reason": f"Demand score {demand['score']}%. Market opportunity detected.",
                    "priority": "medium",
                    "type": "opportunity"
                })
            
            # Price optimization
            elif profit_margin < 15:
                recommendations.append({
                    "productId": item["id"],
                    "product": item["name"],
                    "action": "Review Pricing",
                    "reason": f"Profit margin only {profit_margin:.1f}%. Consider price adjustment.",
                    "priority": "low",
                    "type": "pricing"
                })
        
        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        recommendations.sort(key=lambda x: priority_order.get(x["priority"], 3))
        
        return recommendations[:8]

# Initialize engines
price_model = PricePredictionModel()
demand_model = DemandForecastModel()
recommendation_engine = RecommendationEngine()

# ============== API ENDPOINTS ==============

@app.route('/api/health', methods=['GET'])
def health_check():
    logger.info("Health check endpoint called")
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

# ============== AUTHENTICATION ENDPOINTS ==============

@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("10 per hour")
def register():
    try:
        data = request.get_json()
        validated_data = RegisterSchema(**data)
    except ValidationError as e:
        logger.warning("Registration validation error")
        return jsonify({"message": "Invalid data format", "errors": e.errors()}), 400
        
    if User.query.filter_by(email=validated_data.email).first():
        logger.warning(f"Registration failed: Email {validated_data.email} already exists")
        return jsonify({"message": "Email already registered"}), 409
        
    user = User(
        name=validated_data.name,
        email=validated_data.email,
        role=validated_data.role,
        store_name=validated_data.storeName
    )
    user.set_password(validated_data.password)
    
    db.session.add(user)
    db.session.commit()
    logger.info(f"New user registered: {user.email}")
    
    token = generate_token(user.id)
    
    response = make_response(jsonify({"message": "Registration successful", "user": user.to_dict()}))
    response.set_cookie('auth_token', token, httponly=True, secure=False, samesite='Lax', max_age=86400)
    return response, 201

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("20 per hour")
def login():
    try:
        data = request.get_json()
        validated_data = LoginSchema(**data)
    except ValidationError as e:
        logger.warning("Login validation error")
        return jsonify({"message": "Invalid data format"}), 400
        
    user = User.query.filter_by(email=validated_data.email).first()
    
    if not user or not user.check_password(validated_data.password):
        logger.warning(f"Failed login attempt for email: {validated_data.email if 'email' in validated_data.model_dump() else 'unknown'}")
        return jsonify({"message": "Invalid credentials. Please try again."}), 401
    
    logger.info(f"User logged in: {user.email}")
    token = generate_token(user.id)
    
    response = make_response(jsonify({"message": "Login successful", "user": user.to_dict()}))
    response.set_cookie('auth_token', token, httponly=True, secure=False, samesite='Lax', max_age=86400)
    return response, 200

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user = get_current_user_from_cookie()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    return jsonify({"user": user.to_dict()}), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Logged out successfully"}))
    response.delete_cookie('auth_token')
    return response, 200

# ============== DASHBOARD ENDPOINTS ==============

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Main dashboard endpoint with all summary data"""
    
    # Calculate totals
    total_inventory_value = sum(item["sellingPrice"] * item["quantity"] for item in INVENTORY_DATA)
    total_profit_potential = sum((item["sellingPrice"] - item["purchasePrice"]) * item["quantity"] for item in INVENTORY_DATA)
    dead_stock_count = sum(1 for item in INVENTORY_DATA if item["lastSoldDays"] > 60)
    low_stock_count = sum(1 for item in INVENTORY_DATA if item["quantity"] <= 5)
    
    # Get AI insight
    ai_insight = recommendation_engine.get_top_recommendation()
    
    # Get alerts count
    alerts = get_alerts_data()
    unread_alerts = sum(1 for a in alerts if not a.get("read", False))
    
    return jsonify({
        "stats": {
            "totalInventoryValue": total_inventory_value,
            "totalInventoryValueFormatted": f"₹{total_inventory_value/100000:.1f}L",
            "monthlyProfit": round(total_profit_potential * 0.15),  # Estimate 15% turnover
            "monthlyProfitFormatted": f"₹{round(total_profit_potential * 0.15 / 1000):.0f}K",
            "deadStockCount": dead_stock_count,
            "lowStockCount": low_stock_count,
            "alertsCount": unread_alerts
        },
        "aiInsight": ai_insight,
        "recommendations": recommendation_engine.get_all_recommendations()[:4],
        "alerts": alerts[:4],
        "lastUpdated": datetime.now().isoformat()
    })

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    """Get inventory with demand predictions"""
    enriched_inventory = []
    
    for item in INVENTORY_DATA:
        demand = demand_model.calculate_demand_score(item)
        profit_margin = round((item["sellingPrice"] - item["purchasePrice"]) / item["purchasePrice"] * 100, 1)
        
        enriched_inventory.append({
            **item,
            "profitMargin": profit_margin,
            "demand": demand,
            "status": "Dead Stock" if item["lastSoldDays"] > 60 else "Low Stock" if item["quantity"] <= 5 else "In Stock"
        })
    
    return jsonify({
        "items": enriched_inventory,
        "summary": {
            "totalItems": len(INVENTORY_DATA),
            "totalValue": sum(item["sellingPrice"] * item["quantity"] for item in INVENTORY_DATA),
            "avgProfitMargin": round(np.mean([
                (item["sellingPrice"] - item["purchasePrice"]) / item["purchasePrice"] * 100 
                for item in INVENTORY_DATA
            ]) if INVENTORY_DATA else 0, 1)
        }
    })

@app.route('/api/inventory', methods=['POST'])
def add_inventory():
    """Add new inventory item"""
    data = request.get_json()
    new_item = InventoryItem(
        id=str(random.randint(1000, 9999)),
        name=data.get('name'),
        category=data.get('category'),
        brand=data.get('brand', 'Generic'),
        purchasePrice=float(data.get('purchasePrice')),
        sellingPrice=float(data.get('sellingPrice')),
        quantity=int(data.get('quantity')),
        lastSoldDays=999,  # Never sold
        demandScore=50,
        totalSold=0
    )
    db.session.add(new_item)
    db.session.commit()
    
    INVENTORY_DATA.append(new_item.to_dict())
    return jsonify({"success": True, "item": new_item.to_dict()})

@app.route('/api/inventory/<string:item_id>', methods=['PUT'])
def update_inventory(item_id):
    """Update existing inventory item"""
    data = request.get_json()
    item = InventoryItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Not found"}), 404
        
    item.name = data.get('name', item.name)
    item.category = data.get('category', item.category)
    item.purchasePrice = float(data.get('purchasePrice', item.purchasePrice))
    item.sellingPrice = float(data.get('sellingPrice', item.sellingPrice))
    item.quantity = int(data.get('quantity', item.quantity))
    
    db.session.commit()
    
    # Update global memory
    for i, mem_item in enumerate(INVENTORY_DATA):
        if mem_item["id"] == item_id:
            INVENTORY_DATA[i] = item.to_dict()
            break
            
    return jsonify({"success": True, "item": item.to_dict()})

@app.route('/api/inventory/<string:item_id>', methods=['DELETE'])
def delete_inventory(item_id):
    """Delete inventory item"""
    global INVENTORY_DATA
    item = InventoryItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Not found"}), 404
        
    db.session.delete(item)
    db.session.commit()
    
    INVENTORY_DATA = [i for i in INVENTORY_DATA if i["id"] != item_id]
    return jsonify({"success": True})

@app.route('/api/predictions/price/<product_id>', methods=['GET'])
def get_price_prediction(product_id: str):
    """Get price prediction for a specific product"""
    item = next((i for i in INVENTORY_DATA if i["id"] == product_id), None)
    
    if not item:
        return jsonify({"error": "Product not found"}), 404
    
    prediction = price_model.predict_price(product_id)
    competitors = COMPETITOR_PRICES.get(product_id, {})
    
    if prediction:
        return jsonify({
            "product": item["name"],
            "currentPrice": item["sellingPrice"],
            "prediction": prediction,
            "competitors": competitors,
            "recommendation": "Hold" if prediction["trend"] == "increasing" else "Consider price reduction"
        })
    else:
        # Generate mock prediction if no history
        return jsonify({
            "product": item["name"],
            "currentPrice": item["sellingPrice"],
            "prediction": {
                "historical": [item["sellingPrice"]] * 6,
                "predicted": [round(item["sellingPrice"] * (1 - 0.02 * i)) for i in range(1, 4)],
                "trend": "stable",
                "confidence": 70.0
            },
            "competitors": competitors,
            "recommendation": "Monitor market"
        })

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Get all AI recommendations"""
    return jsonify({
        "topInsight": recommendation_engine.get_top_recommendation(),
        "recommendations": recommendation_engine.get_all_recommendations(),
        "generatedAt": datetime.now().isoformat()
    })

def get_alerts_data():
    """Generate alerts based on current inventory state"""
    alerts = []
    
    for item in INVENTORY_DATA:
        # Dead stock alert
        if item["lastSoldDays"] > 60:
            alerts.append({
                "id": f"alert-dead-{item['id']}",
                "productId": item["id"],
                "productName": item["name"],
                "type": "dead_stock",
                "severity": "warning",
                "message": f"Unsold for {item['lastSoldDays']}+ days. Consider discounting.",
                "createdAt": (datetime.now() - timedelta(days=1)).isoformat(),
                "read": False
            })
        
        # Low stock alert
        if item["quantity"] <= 5:
            demand = demand_model.calculate_demand_score(item)
            if demand["score"] >= 70:
                alerts.append({
                    "id": f"alert-low-{item['id']}",
                    "productId": item["id"],
                    "productName": item["name"],
                    "type": "low_stock",
                    "severity": "critical",
                    "message": f"Only {item['quantity']} units left with {demand['level']} demand!",
                    "createdAt": datetime.now().isoformat(),
                    "read": False
                })
        
        # Price drop alert (competitor pricing)
        if item["id"] in COMPETITOR_PRICES:
            competitors = COMPETITOR_PRICES[item["id"]]
            min_competitor = min(competitors.values())
            if min_competitor < item["sellingPrice"]:
                diff = item["sellingPrice"] - min_competitor
                alerts.append({
                    "id": f"alert-price-{item['id']}",
                    "productId": item["id"],
                    "productName": item["name"],
                    "type": "price_drop",
                    "severity": "info",
                    "message": f"Competitor price ₹{diff:,} lower. Consider matching.",
                    "createdAt": (datetime.now() - timedelta(hours=3)).isoformat(),
                    "read": True
                })
    
    # Sort by severity
    severity_order = {"critical": 0, "warning": 1, "info": 2}
    alerts.sort(key=lambda x: severity_order.get(x["severity"], 3))
    
    return alerts

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all alerts"""
    return jsonify({
        "alerts": get_alerts_data(),
        "summary": {
            "total": len(get_alerts_data()),
            "unread": sum(1 for a in get_alerts_data() if not a.get("read", False)),
            "critical": sum(1 for a in get_alerts_data() if a["severity"] == "critical")
        }
    })

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get sales and profit analytics"""
    # Generate realistic monthly data
    months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]
    base_revenue = 420000
    
    sales_data = []
    for i, month in enumerate(months):
        growth = 1 + (i * 0.12) + random.uniform(-0.05, 0.15)
        revenue = round(base_revenue * growth)
        profit = round(revenue * random.uniform(0.14, 0.18))
        sales_data.append({
            "month": month,
            "revenue": revenue,
            "profit": profit,
            "profitMargin": round(profit / revenue * 100, 1)
        })
    
    # Category distribution
    category_data = {}
    for item in INVENTORY_DATA:
        cat = item["category"]
        value = item["sellingPrice"] * item["quantity"]
        category_data[cat] = category_data.get(cat, 0) + value
    
    total_value = sum(category_data.values())
    category_distribution = [
        {"name": cat, "value": round(val / total_value * 100), "amount": val}
        for cat, val in sorted(category_data.items(), key=lambda x: -x[1])
    ]
    
    return jsonify({
        "salesTrend": sales_data,
        "categoryDistribution": category_distribution,
        "profitByCategory": [
            {"category": cat, "profit": round(val * 0.18), "margin": round(random.uniform(16, 24), 1)}
            for cat, val in category_data.items()
        ],
        "summary": {
            "totalRevenue": sum(d["revenue"] for d in sales_data),
            "totalProfit": sum(d["profit"] for d in sales_data),
            "avgMargin": round(np.mean([d["profitMargin"] for d in sales_data]), 1)
        }
    })

# ============== AI CHAT ENDPOINT ==============

def get_inventory_context():
    """Generate context about current inventory for AI"""
    total_value = sum(item["sellingPrice"] * item["quantity"] for item in INVENTORY_DATA)
    low_stock = [item for item in INVENTORY_DATA if item["quantity"] <= 5]
    dead_stock = [item for item in INVENTORY_DATA if item["lastSoldDays"] > 60]
    high_demand = [item for item in INVENTORY_DATA if item["demandScore"] >= 85]
    
    context = f"""
You are an AI assistant for TechStock AI, a computer hardware inventory management system for retailers.

CURRENT INVENTORY STATUS:
- Total inventory value: ₹{total_value:,}
- Total products: {len(INVENTORY_DATA)}
- Low stock items ({len(low_stock)}): {', '.join([i['name'] for i in low_stock]) or 'None'}
- Dead stock items ({len(dead_stock)}): {', '.join([i['name'] for i in dead_stock]) or 'None'}
- High demand items ({len(high_demand)}): {', '.join([i['name'] for i in high_demand]) or 'None'}

PRODUCT DETAILS:
"""
    for item in INVENTORY_DATA:
        margin = ((item["sellingPrice"] - item["purchasePrice"]) / item["purchasePrice"] * 100)
        context += f"- {item['name']}: ₹{item['sellingPrice']:,} | Qty: {item['quantity']} | Margin: {margin:.1f}% | Last sold: {item['lastSoldDays']} days ago | Demand: {item['demandScore']}%\n"
    
    context += """
Provide helpful, actionable advice about inventory management, pricing, restocking, and business strategy.
Be concise but thorough. Use ₹ for currency. Focus on practical recommendations.
"""
    return context


def get_fallback_response(message: str) -> str:
    """Smart fallback responses when Gemini is unavailable"""
    message_lower = message.lower()
    
    # Get current data
    low_stock = [item for item in INVENTORY_DATA if item["quantity"] <= 5]
    dead_stock = [item for item in INVENTORY_DATA if item["lastSoldDays"] > 60]
    high_demand = [item for item in INVENTORY_DATA if item["demandScore"] >= 85]
    
    if any(word in message_lower for word in ['restock', 'buy', 'order', 'purchase']):
        if low_stock:
            items = ', '.join([f"{i['name']} ({i['quantity']} left)" for i in low_stock[:3]])
            return f"📦 **Restock Priority:**\n\nThese items need immediate restocking:\n{items}\n\nThey have high demand but low inventory. Consider ordering within the next 3-5 days to avoid stockouts."
        return "✅ Your stock levels look healthy! No urgent restocking needed."
    
    if any(word in message_lower for word in ['dead', 'slow', 'not selling', 'discount']):
        if dead_stock:
            items = '\n'.join([f"- {i['name']}: {i['lastSoldDays']} days unsold, {i['quantity']} units" for i in dead_stock])
            return f"⚠️ **Dead Stock Alert:**\n\n{items}\n\n**Recommendation:** Consider 15-20% discount or bundle deals to clear these items."
        return "✅ No dead stock detected! All products are moving well."
    
    if any(word in message_lower for word in ['trending', 'hot', 'demand', 'popular', 'best']):
        if high_demand:
            items = '\n'.join([f"- {i['name']}: {i['demandScore']}% demand score" for i in high_demand[:5]])
            return f"🔥 **High Demand Products:**\n\n{items}\n\nThese items are selling fast. Ensure adequate stock levels!"
        return "Current inventory has moderate demand across all categories."
    
    if any(word in message_lower for word in ['profit', 'margin', 'money', 'revenue']):
        total_profit_potential = sum((i["sellingPrice"] - i["purchasePrice"]) * i["quantity"] for i in INVENTORY_DATA)
        best_margin = max(INVENTORY_DATA, key=lambda x: (x["sellingPrice"] - x["purchasePrice"]) / x["purchasePrice"])
        margin_pct = ((best_margin["sellingPrice"] - best_margin["purchasePrice"]) / best_margin["purchasePrice"] * 100)
        return f"💰 **Profit Analysis:**\n\n- Total profit potential: ₹{total_profit_potential:,}\n- Best margin product: {best_margin['name']} ({margin_pct:.1f}%)\n\nFocus on high-margin, high-demand items for maximum returns."
    
    if any(word in message_lower for word in ['advice', 'suggest', 'recommend', 'should', 'what']):
        tips = []
        if low_stock:
            tips.append(f"🔴 Restock {low_stock[0]['name']} urgently")
        if dead_stock:
            tips.append(f"🟡 Clear {dead_stock[0]['name']} with discounts")
        if high_demand:
            tips.append(f"🟢 Increase stock of {high_demand[0]['name']}")
        tips.append("📊 Monitor competitor prices weekly")
        return "**Quick Recommendations:**\n\n" + '\n'.join(tips)
    
    # Default response
    return """👋 **Hi! I'm your TechStock AI Assistant.**

I can help you with:
- 📦 **Restocking advice** - "What should I restock?"
- 💀 **Dead stock analysis** - "Show me slow-moving items"
- 🔥 **Trending products** - "What's selling well?"
- 💰 **Profit insights** - "How can I improve margins?"
- 📊 **General advice** - "Give me recommendations"

What would you like to know?"""

@app.route('/api/chat/status', methods=['GET'])
def chat_status():
    """Check if Gemini AI is available"""
    return jsonify({
        "geminiAvailable": GEMINI_AVAILABLE,
        "model": "gemini-2.0-flash" if GEMINI_AVAILABLE else None
    })

# ============== PRICE TRACKING ENDPOINTS ==============

# Extended competitor price data for all inventory items
COMPETITOR_PRICES_FULL = {
    "1": {"amazon": 33499, "flipkart": 34299, "mdcomputers": 33999, "primeabgb": 34199},
    "2": {"amazon": 63999, "flipkart": 65499, "mdcomputers": 62999, "primeabgb": 63499},
    "3": {"amazon": 8499, "flipkart": 8799, "mdcomputers": 8599, "primeabgb": 8699},
    "4": {"amazon": 13999, "flipkart": 14299, "mdcomputers": 13799, "primeabgb": 14099},
    "5": {"amazon": 47999, "flipkart": 49499, "mdcomputers": 46999, "primeabgb": 48499},
    "6": {"amazon": 77999, "flipkart": 79499, "mdcomputers": 76999, "primeabgb": 78499},
    "7": {"amazon": 3299, "flipkart": 3449, "mdcomputers": 3199, "primeabgb": 3399},
    "8": {"amazon": 21999, "flipkart": 22499, "mdcomputers": 21499, "primeabgb": 22299},
    "9": {"amazon": 9999, "flipkart": 10299, "mdcomputers": 9799, "primeabgb": 10199},
    "10": {"amazon": 28999, "flipkart": 29499, "mdcomputers": 28499, "primeabgb": 29199},
}

# Sales history data
SALES_HISTORY = [
    {"id": "sale-1", "productId": "1", "productName": "AMD Ryzen 7 7800X3D", "quantity": 2, "soldPrice": 34500, "purchasePrice": 28500, "profit": 12000, "customerName": "Rahul Sharma", "customerPhone": "9876543210", "soldAt": "2024-01-15T10:30:00"},
    {"id": "sale-2", "productId": "2", "productName": "NVIDIA RTX 4070 Ti Super", "quantity": 1, "soldPrice": 63999, "purchasePrice": 52000, "profit": 11999, "customerName": "Priya Patel", "customerPhone": "9876543211", "soldAt": "2024-01-16T14:15:00"},
    {"id": "sale-3", "productId": "3", "productName": "Corsair Vengeance DDR5 32GB", "quantity": 3, "soldPrice": 8800, "purchasePrice": 7200, "profit": 4800, "customerName": "Amit Kumar", "customerPhone": "9876543212", "soldAt": "2024-01-17T09:45:00"},
    {"id": "sale-4", "productId": "10", "productName": "NVIDIA RTX 4060", "quantity": 2, "soldPrice": 29500, "purchasePrice": 24000, "profit": 11000, "customerName": "Sneha Gupta", "customerPhone": "9876543213", "soldAt": "2024-01-18T16:20:00"},
    {"id": "sale-5", "productId": "9", "productName": "Corsair RM850x", "quantity": 1, "soldPrice": 10200, "purchasePrice": 8500, "profit": 1700, "customerName": "Vijay Singh", "customerPhone": "9876543214", "soldAt": "2024-01-19T11:00:00"},
]

# Simulated price history data (last 30 days)
def generate_price_history(product_id: str, product_name: str, selling_price: int) -> list:
    """Generate realistic 30-day price history for a product"""
    history = []
    base_date = datetime.now() - timedelta(days=30)
    competitor_prices = COMPETITOR_PRICES_FULL.get(product_id, {})
    
    # Generate historical data with slight variations
    for i in range(30):
        date = base_date + timedelta(days=i)
        
        # Add some randomness but keep trends
        variation = random.uniform(-0.03, 0.03)
        your_price_variation = random.uniform(-0.02, 0.02)
        
        avg_competitor = np.mean(list(competitor_prices.values())) if competitor_prices else selling_price * 0.95
        
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "yourPrice": round(selling_price * (1 + your_price_variation)),
            "competitorAvg": round(avg_competitor * (1 + variation)),
            "amazon": round(competitor_prices.get("amazon", avg_competitor) * (1 + variation)),
            "flipkart": round(competitor_prices.get("flipkart", avg_competitor) * (1 + variation * 1.1)),
            "mdcomputers": round(competitor_prices.get("mdcomputers", avg_competitor) * (1 + variation * 0.9)),
        })
    
    return history

@app.route('/api/price-tracking', methods=['GET'])
def get_price_tracking():
    """Get all products with competitor price comparison"""
    price_tracking_data = []
    
    for item in INVENTORY_DATA:
        competitor_prices = COMPETITOR_PRICES_FULL.get(item["id"], {})
        
        if competitor_prices:
            competitor_avg = round(np.mean(list(competitor_prices.values())))
        else:
            # Generate mock competitor prices if not available
            competitor_avg = round(item["sellingPrice"] * random.uniform(0.92, 1.05))
        
        # Calculate recommended price: (competitor avg + purchase price) / 2 with 15% margin buffer
        recommended_price = round((competitor_avg + item["purchasePrice"]) / 2 * 1.15)
        
        # Ensure recommended price gives at least 10% margin
        min_price = round(item["purchasePrice"] * 1.10)
        recommended_price = max(recommended_price, min_price)
        
        # Calculate profit margin
        profit_margin = round(((item["sellingPrice"] - item["purchasePrice"]) / item["purchasePrice"]) * 100, 1)
        
        # Determine price status
        price_diff = item["sellingPrice"] - competitor_avg
        if price_diff > 1000:
            status = "Higher"
            status_color = "red"
        elif price_diff < -500:
            status = "Lower"
            status_color = "yellow"
        else:
            status = "Optimal"
            status_color = "green"
        
        price_tracking_data.append({
            "id": item["id"],
            "productName": item["name"],
            "category": item["category"],
            "purchasePrice": item["purchasePrice"],
            "yourPrice": item["sellingPrice"],
            "competitorAvg": competitor_avg,
            "amazon": competitor_prices.get("amazon"),
            "flipkart": competitor_prices.get("flipkart"),
            "mdcomputers": competitor_prices.get("mdcomputers"),
            "primeabgb": competitor_prices.get("primeabgb"),
            "recommendedPrice": recommended_price,
            "profitMargin": profit_margin,
            "priceStatus": status,
            "priceStatusColor": status_color,
            "quantity": item["quantity"],
            "lastSoldDays": item["lastSoldDays"],
            "demandScore": item["demandScore"],
        })
    
    return jsonify({
        "products": price_tracking_data,
        "lastUpdated": datetime.now().isoformat()
    })

@app.route('/api/price-history/<product_id>', methods=['GET'])
def get_price_history(product_id: str):
    """Get price history for a specific product"""
    item = next((i for i in INVENTORY_DATA if i["id"] == product_id), None)
    
    if not item:
        return jsonify({"error": "Product not found"}), 404
    
    history = generate_price_history(product_id, item["name"], item["sellingPrice"])
    
    return jsonify({
        "productId": product_id,
        "productName": item["name"],
        "history": history,
        "summary": {
            "avgYourPrice": round(np.mean([h["yourPrice"] for h in history])),
            "avgCompetitorPrice": round(np.mean([h["competitorAvg"] for h in history])),
            "priceRange": {
                "min": min([h["competitorAvg"] for h in history]),
                "max": max([h["competitorAvg"] for h in history])
            }
        }
    })

@app.route('/api/price-prediction/<product_id>', methods=['GET'])
def get_price_prediction_detailed(product_id: str):
    """Get detailed price prediction for a product"""
    item = next((i for i in INVENTORY_DATA if i["id"] == product_id), None)
    
    if not item:
        return jsonify({"error": "Product not found"}), 404
    
    competitor_prices = COMPETITOR_PRICES_FULL.get(product_id, {})
    current_avg = np.mean(list(competitor_prices.values())) if competitor_prices else item["sellingPrice"] * 0.95
    
    # Generate prediction using simple trend analysis
    # Simulating a slight downward trend for tech products (typical depreciation)
    trend_factor = random.uniform(-0.05, 0.02)  # -5% to +2% change
    predicted_price = round(current_avg * (1 + trend_factor))
    
    change_percent = round(((predicted_price - current_avg) / current_avg) * 100, 1)
    trend_direction = "UP" if change_percent > 0 else "DOWN" if change_percent < 0 else "STABLE"
    
    # Generate 7-day and 30-day predictions
    predictions = []
    for days in [7, 14, 21, 30]:
        factor = trend_factor * (days / 30)
        predictions.append({
            "days": days,
            "predictedPrice": round(current_avg * (1 + factor)),
            "confidence": round(90 - (days * 0.5) + random.uniform(-5, 5), 1)
        })
    
    return jsonify({
        "productId": product_id,
        "productName": item["name"],
        "currentAvgPrice": round(current_avg),
        "predictedPrice": predicted_price,
        "predictedChangePercent": change_percent,
        "trend": trend_direction,
        "predictions": predictions,
        "factors": [
            {"factor": "Market demand", "impact": "High" if item["demandScore"] >= 70 else "Medium"},
            {"factor": "Competitor pricing", "impact": "Moderate"},
            {"factor": "New product releases", "impact": "Low"},
        ],
        "confidence": round(random.uniform(75, 92), 1)
    })

@app.route('/api/price-suggestions', methods=['GET'])
def get_price_suggestions():
    """Get AI-powered price suggestions for best products to sell/buy"""
    best_to_sell = None
    best_to_buy = None
    best_sell_score = 0
    best_buy_score = 0
    
    suggestions = []
    
    for item in INVENTORY_DATA:
        competitor_prices = COMPETITOR_PRICES_FULL.get(item["id"], {})
        competitor_avg = np.mean(list(competitor_prices.values())) if competitor_prices else item["sellingPrice"] * 0.95
        
        profit_margin = ((item["sellingPrice"] - item["purchasePrice"]) / item["purchasePrice"]) * 100
        price_advantage = ((competitor_avg - item["sellingPrice"]) / competitor_avg) * 100 if competitor_avg > 0 else 0
        
        # Score for selling (high margin + high demand + competitive price)
        sell_score = (
            profit_margin * 0.3 +
            item["demandScore"] * 0.4 +
            max(0, price_advantage) * 0.3
        )
        
        # Score for stocking (high demand + good margin potential + low current stock)
        stock_score = (
            item["demandScore"] * 0.5 +
            profit_margin * 0.2 +
            (100 - min(item["quantity"], 100)) * 0.3
        )
        
        if sell_score > best_sell_score and item["quantity"] > 0:
            best_sell_score = sell_score
            best_to_sell = {
                "product": item["name"],
                "productId": item["id"],
                "profitMargin": round(profit_margin, 1),
                "demandScore": item["demandScore"],
                "currentStock": item["quantity"],
                "yourPrice": item["sellingPrice"],
                "competitorAvg": round(competitor_avg),
                "priceAdvantage": round(price_advantage, 1)
            }
        
        if stock_score > best_buy_score and item["quantity"] <= 10:
            best_buy_score = stock_score
            best_to_buy = {
                "product": item["name"],
                "productId": item["id"],
                "demandScore": item["demandScore"],
                "currentStock": item["quantity"],
                "profitMargin": round(profit_margin, 1)
            }
        
        # Generate individual suggestions
        if profit_margin > 20 and item["demandScore"] >= 80:
            suggestions.append({
                "product": item["name"],
                "type": "sell",
                "reason": f"High profit margin ({profit_margin:.1f}%) with strong demand ({item['demandScore']}%)",
                "priority": "high"
            })
        elif item["quantity"] <= 5 and item["demandScore"] >= 70:
            suggestions.append({
                "product": item["name"],
                "type": "restock",
                "reason": f"Low stock ({item['quantity']} units) but high demand ({item['demandScore']}%)",
                "priority": "high"
            })
        elif item["sellingPrice"] > competitor_avg * 1.05:
            suggestions.append({
                "product": item["name"],
                "type": "price_reduce",
                "reason": f"Your price ₹{item['sellingPrice']:,} is above market average ₹{round(competitor_avg):,}",
                "priority": "medium"
            })
    
    # Generate AI insight message
    if best_to_sell:
        sell_reason = f"{best_to_sell['product']} has a {best_to_sell['profitMargin']}% profit margin with {best_to_sell['demandScore']}% demand score"
        if best_to_sell['priceAdvantage'] > 0:
            sell_reason += f" and is priced {best_to_sell['priceAdvantage']:.1f}% below competitors"
    else:
        sell_reason = "Market conditions are stable"
    
    return jsonify({
        "bestToSell": best_to_sell,
        "bestToStock": best_to_buy,
        "suggestions": suggestions[:6],
        "aiInsight": {
            "title": "AI Price Intelligence",
            "message": f"Based on current market analysis, {best_to_sell['product'] if best_to_sell else 'No product'} is the best product to sell now. {sell_reason}.",
            "recommendation": "Focus on high-margin, high-demand items for maximum profitability."
        },
        "generatedAt": datetime.now().isoformat()
    })

# ==================== SALES ENDPOINTS ====================

@app.route('/api/sales', methods=['POST'])
def record_sale():
    """Record a new sale and update inventory"""
    global SALES_HISTORY, INVENTORY_DATA
    
    data = request.get_json()
    product_id = data.get('productId')
    quantity = data.get('quantity', 1)
    sold_price = data.get('soldPrice')
    customer_name = data.get('customerName', '')
    customer_phone = data.get('customerPhone', '')
    
    # Find the product
    product = next((p for p in INVENTORY_DATA if p["id"] == product_id), None)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    if product["quantity"] < quantity:
        return jsonify({"error": f"Insufficient stock. Only {product['quantity']} available"}), 400
    
    # Calculate profit
    purchase_price = product["purchasePrice"]
    total_profit = (sold_price - purchase_price) * quantity
    profit_margin = round(((sold_price - purchase_price) / purchase_price) * 100, 1)
    
    # Create sale record
    sale_id = f"sale-{len(SALES_HISTORY) + 1}"
    sale_record = {
        "id": sale_id,
        "productId": product_id,
        "productName": product["name"],
        "category": product["category"],
        "brand": product["brand"],
        "quantity": quantity,
        "soldPrice": sold_price,
        "purchasePrice": purchase_price,
        "profit": total_profit,
        "profitMargin": profit_margin,
        "customerName": customer_name,
        "customerPhone": customer_phone,
        "soldAt": datetime.now().isoformat()
    }
    
    # Add to DB and memory
    db_sale = SaleRecordModel(**sale_record)
    db.session.add(db_sale)
    
    # Update inventory in DB
    db_product = InventoryItem.query.get(product_id)
    if db_product:
        db_product.quantity -= quantity
        db_product.totalSold += quantity
        db_product.lastSoldDays = 0
    
    db.session.commit()
    
    SALES_HISTORY.append(sale_record)
    for i, mem_item in enumerate(INVENTORY_DATA):
        if mem_item["id"] == product_id:
            mem_item["quantity"] -= quantity
            mem_item["totalSold"] += quantity
            mem_item["lastSoldDays"] = 0
            break
            
    return jsonify({
        "success": True,
        "message": f"Sale recorded successfully",
        "sale": sale_record,
        "remainingStock": product["quantity"]
    })

@app.route('/api/sales-history', methods=['GET'])
def get_sales_history():
    """Get all sales history with analytics"""
    # Calculate analytics
    total_revenue = sum(s["soldPrice"] * s["quantity"] for s in SALES_HISTORY)
    total_profit = sum(s["profit"] for s in SALES_HISTORY)
    total_items_sold = sum(s["quantity"] for s in SALES_HISTORY)
    
    # Get sales by category
    category_sales = {}
    for sale in SALES_HISTORY:
        cat = sale.get("category", "Unknown")
        if cat not in category_sales:
            category_sales[cat] = {"count": 0, "revenue": 0, "profit": 0}
        category_sales[cat]["count"] += sale["quantity"]
        category_sales[cat]["revenue"] += sale["soldPrice"] * sale["quantity"]
        category_sales[cat]["profit"] += sale["profit"]
    
    # Get top selling products
    product_sales = {}
    for sale in SALES_HISTORY:
        pid = sale["productId"]
        if pid not in product_sales:
            product_sales[pid] = {"name": sale["productName"], "quantity": 0, "revenue": 0}
        product_sales[pid]["quantity"] += sale["quantity"]
        product_sales[pid]["revenue"] += sale["soldPrice"] * sale["quantity"]
    
    top_selling = sorted(product_sales.values(), key=lambda x: x["quantity"], reverse=True)[:5]
    
    return jsonify({
        "sales": sorted(SALES_HISTORY, key=lambda x: x["soldAt"], reverse=True),
        "analytics": {
            "totalRevenue": total_revenue,
            "totalProfit": total_profit,
            "totalItemsSold": total_items_sold,
            "averageProfit": round(total_profit / len(SALES_HISTORY)) if SALES_HISTORY else 0,
            "totalTransactions": len(SALES_HISTORY)
        },
        "categorySales": category_sales,
        "topSelling": top_selling
    })

@app.route('/api/sales/suggest-price/<product_id>', methods=['GET'])
def suggest_sale_price(product_id):
    """Get AI suggested selling price based on margins and competition"""
    # Find the product
    product = next((p for p in INVENTORY_DATA if p["id"] == product_id), None)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    purchase_price = product["purchasePrice"]
    current_price = product["sellingPrice"]
    demand_score = product["demandScore"]
    competitor_prices = COMPETITOR_PRICES_FULL.get(product_id, {})
    
    # Calculate competitor average
    if competitor_prices:
        competitor_avg = np.mean(list(competitor_prices.values()))
        min_competitor = min(competitor_prices.values())
        max_competitor = max(competitor_prices.values())
    else:
        competitor_avg = current_price * 0.97
        min_competitor = current_price * 0.92
        max_competitor = current_price * 1.05
    
    # Calculate different margin prices
    margin_10 = round(purchase_price * 1.10)
    margin_15 = round(purchase_price * 1.15)
    margin_20 = round(purchase_price * 1.20)
    margin_25 = round(purchase_price * 1.25)
    
    # AI suggested price based on demand and competition
    if demand_score >= 85:
        # High demand - can price higher
        ai_suggested = round(min(current_price, competitor_avg * 1.02))
        suggestion_reason = "High demand allows premium pricing near market rates"
    elif demand_score >= 60:
        # Medium demand - competitive pricing
        ai_suggested = round(min(current_price * 0.98, competitor_avg * 0.98))
        suggestion_reason = "Moderate demand suggests competitive pricing slightly below market"
    else:
        # Low demand - aggressive pricing to move stock
        ai_suggested = round(min(current_price * 0.92, competitor_avg * 0.94))
        suggestion_reason = "Low demand - recommend aggressive pricing to clear inventory"
    
    ai_profit = ai_suggested - purchase_price
    ai_margin = round((ai_profit / purchase_price) * 100, 1)
    
    return jsonify({
        "productId": product_id,
        "productName": product["name"],
        "purchasePrice": purchase_price,
        "currentSellingPrice": current_price,
        "demandScore": demand_score,
        "competitorAvg": round(competitor_avg),
        "competitorRange": {"min": round(min_competitor), "max": round(max_competitor)},
        "aiSuggestedPrice": ai_suggested,
        "aiProfitAmount": ai_profit,
        "aiProfitMargin": ai_margin,
        "suggestionReason": suggestion_reason,
        "marginOptions": [
            {"margin": 10, "price": margin_10, "profit": margin_10 - purchase_price},
            {"margin": 15, "price": margin_15, "profit": margin_15 - purchase_price},
            {"margin": 20, "price": margin_20, "profit": margin_20 - purchase_price},
            {"margin": 25, "price": margin_25, "profit": margin_25 - purchase_price},
        ],
        "recommendation": f"Based on {demand_score}% demand score and ₹{round(competitor_avg)} avg competitor price, sell at ₹{ai_suggested} for {ai_margin}% margin."
    })

# ==================== BUILD GENERATOR ENDPOINT ====================

@app.route('/api/generate-build', methods=['POST'])
def generate_build():
    """Generate PC build using AI or fallback logic"""
    data = request.get_json()
    purpose = data.get('purpose', 'Gaming')
    budget = int(data.get('budget', 100000))
    
    if GEMINI_AVAILABLE and gemini_model:
        try:
            prompt = f"""
            Act as an expert PC builder. Create a custom PC build for "{purpose}" with a maximum budget of ₹{budget}.
            Return ONLY a valid JSON object with the following structure (no markdown formatting):
            {{
                "name": "Build Name",
                "cpu": "CPU Name",
                "gpu": "GPU Name",
                "ram": "RAM Details",
                "storage": "Storage Details",
                "motherboard": "Motherboard Name",
                "psu": "PSU Details",
                "case": "Case Name",
                "totalPrice": Estimated Total Price (number),
                "description": "Brief explanation of why this build is good for the purpose"
            }}
            Ensure the total price is close to but not exceeding ₹{budget}. Use current Indian market prices.
            """
            
            response = gemini_model.generate_content(prompt)
            # Clean up response text if it contains markdown code blocks
            text = response.text.replace('```json', '').replace('```', '').strip()
            build_data = json.loads(text)
            build_data['id'] = f"ai-build-{random.randint(1000, 9999)}"
            build_data['source'] = 'AI'
            return jsonify(build_data)
            
        except Exception as e:
            print(f"AI Build Generation failed: {e}")
            # Fall through to fallback
            pass
            
    # Fallback Logic (Mock Generation)
    # Scale components based on budget
    budget_scale = budget / 100000
    
    if purpose == "Gaming":
        cpu = "AMD Ryzen 5 7600X" if budget < 80000 else "AMD Ryzen 7 7800X3D" if budget < 200000 else "Intel Core i9-14900K"
        gpu = "NVIDIA RTX 4060" if budget < 80000 else "NVIDIA RTX 4070 Ti Super" if budget < 150000 else "NVIDIA RTX 4090"
    elif purpose == "Editing":
        cpu = "Intel Core i5-13600K" if budget < 100000 else "Intel Core i7-14700K"
        gpu = "NVIDIA RTX 3060 12GB" if budget < 100000 else "NVIDIA RTX 4070"
    else:
        cpu = "Intel Core i3-12100" if budget < 40000 else "Intel Core i5-12400"
        gpu = "Integrated Graphics" if budget < 50000 else "NVIDIA GTX 1650"

    return jsonify({
        "id": f"fallback-build-{random.randint(1000, 9999)}",
        "name": f"{purpose} Beast (Standard)",
        "cpu": cpu,
        "gpu": gpu,
        "ram": "16GB DDR5 5200MHz" if budget > 60000 else "16GB DDR4 3200MHz",
        "storage": "1TB NVMe SSD Gen4" if budget > 80000 else "500GB NVMe SSD",
        "motherboard": "B650 WiFi" if "AMD" in cpu else "B760 WiFi",
        "psu": "750W Gold Modular" if budget > 100000 else "650W Bronze",
        "case": "Lian Li Lancool 216" if budget > 100000 else "Ant Esports ICE-511",
        "totalPrice": int(budget * 0.95),
        "description": "Optimized configuration based on your budget constrainst (Standard Recommendation).",
        "source": "Rule-Based"
    })


# ==================== CHAT AI ENDPOINT ====================

@app.route('/api/chat', methods=['POST'])
def ai_chat():
    """Live Gemini AI Chat connected to current memory inventory"""
    data = request.get_json()
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
        
    if not GEMINI_AVAILABLE or not gemini_model:
        return jsonify({
            "response": "⚠️ Sorry, my Gemini AI brain is disconnected! Please ensure `GEMINI_API_KEY` is properly configured in your backend `.env` file."
        }), 200
        
    if GEMINI_API_KEY == 'AIzaSyCqgOnZ2Gr10rQefZl1Xsyvs3KSmlzsL_8':
        return jsonify({
            "response": "⚠️ **Configuration Needed!**\n\nThe current `GEMINI_API_KEY` in your `.env` is a dummy placeholder.\nPlease get a free Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey) and place it in `backend/.env`!"
        }), 200

    try:
        # Build live context from database memory
        total_items = len(INVENTORY_DATA)
        total_stock = sum(item["quantity"] for item in INVENTORY_DATA)
        total_value = sum(item["sellingPrice"] * item["quantity"] for item in INVENTORY_DATA)
        
        low_stock_items = [i["name"] for i in INVENTORY_DATA if i["quantity"] > 0 and i["quantity"] <= 5]
        out_of_stock_items = [i["name"] for i in INVENTORY_DATA if i["quantity"] == 0]
        dead_stock = [i["name"] for i in INVENTORY_DATA if i["lastSoldDays"] > 30]

        context_prompt = f"""
        You are a highly capable AI Inventory Advisor embedded directly into the "TechStock AI" application context. 
        You analyze their LIVE internal hardware store data below:
        - Total Products Tracked: {total_items}
        - Total Stock Value (MRP): ₹{"{:,.0f}".format(total_value)} 
        - Total Units on Hand: {total_stock}
        - Out of Stock items: {', '.join(out_of_stock_items) if out_of_stock_items else 'None'}
        - Low Stock items (≤5): {', '.join(low_stock_items) if low_stock_items else 'None'}
        - Dead Stock (>30 days unsold): {', '.join(dead_stock) if dead_stock else 'None'}

        Always respond concisely using markdown profiling (boldings/bullet points). 
        You must specifically incorporate the LIVE store data statistics accurately above!
        
        The user asks: "{user_message}"
        """
        
        response = gemini_model.generate_content(context_prompt)
        text_response = response.text
        
        return jsonify({"response": text_response})

    except Exception as e:
        logger.error(f"Chat generation failure: {e}")
        return jsonify({
            "response": "⚠️ An internal error interrupted the AI generation pipeline. Please check backend logs."
        }), 500

if __name__ == '__main__':
    print("🚀 TechStock AI ML Backend starting...")
    print("📊 Endpoints available at http://localhost:5000/api/")
    if GEMINI_AVAILABLE:
        print("🤖 Gemini AI: Enabled")
    else:
        print("⚠️  Gemini AI: Disabled (set GEMINI_API_KEY env variable to enable)")
    app.run(debug=True, port=5000)
