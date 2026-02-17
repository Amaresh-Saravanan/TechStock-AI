# TechStock AI - ML Backend

A Flask-based backend providing ML predictions and real-time inventory analytics.

## Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## API Endpoints

- `GET /api/dashboard` - Dashboard summary with AI insights
- `GET /api/inventory` - Inventory data with predictions
- `GET /api/predictions/price/<product_id>` - Price prediction for a product
- `GET /api/recommendations` - AI-powered recommendations
- `GET /api/alerts` - Real-time alerts
- `GET /api/analytics` - Sales and profit analytics

## ML Models

- **Price Prediction**: Linear regression + seasonal adjustments
- **Demand Forecasting**: Time series analysis
- **Stock Recommendations**: Rule-based + ML scoring
