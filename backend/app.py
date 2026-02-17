from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from datetime import datetime, timedelta
import random
import os

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
CORS(app)

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
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

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
            ]), 1)
        }
    })

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

@app.route('/api/chat', methods=['POST'])
def chat():
    """AI Chat endpoint using Gemini"""
    data = request.get_json()
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400
    
    if not GEMINI_AVAILABLE or not gemini_model:
        # Fallback response when Gemini is not available
        return jsonify({
            "response": get_fallback_response(user_message),
            "source": "fallback"
        })
    
    try:
        # Build context with inventory data
        context = get_inventory_context()
        full_prompt = f"{context}\n\nUser question: {user_message}"
        
        # Generate response
        response = gemini_model.generate_content(full_prompt)
        
        return jsonify({
            "response": response.text,
            "source": "gemini"
        })
    except Exception as e:
        return jsonify({
            "response": get_fallback_response(user_message),
            "source": "fallback",
            "error": str(e)
        })

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
    
    # Update inventory
    product["quantity"] -= quantity
    product["totalSold"] = product.get("totalSold", 0) + quantity
    product["lastSoldDays"] = 0  # Reset last sold days
    
    # Add to sales history
    SALES_HISTORY.append(sale_record)
    
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

if __name__ == '__main__':
    print("🚀 TechStock AI ML Backend starting...")
    print("📊 Endpoints available at http://localhost:5000/api/")
    if GEMINI_AVAILABLE:
        print("🤖 Gemini AI: Enabled")
    else:
        print("⚠️  Gemini AI: Disabled (set GEMINI_API_KEY env variable to enable)")
    app.run(debug=True, port=5000)
