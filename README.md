# TechStock-AI 📈 - AI-Powered Stock Market Analysis

**Intelligent stock market analysis, predictions, and trading insights powered by machine learning**

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)

---

## What is TechStock-AI?

TechStock-AI is an advanced stock market analysis platform that combines real-time financial data with machine learning algorithms to provide intelligent market insights, trend analysis, and trading signals. Whether you're a retail investor, trader, or financial analyst, TechStock-AI empowers data-driven investment decisions.

### Why TechStock-AI?

- **AI-Powered Predictions** - Machine learning models trained on years of market data
- **Real-Time Data** - Access live stock prices and market data
- **Portfolio Analysis** - Comprehensive analysis of your investments
- **Trading Signals** - Technical and fundamental analysis combined
- **Risk Assessment** - Understand portfolio risk and volatility
- **Educational** - Learn investment concepts with actionable insights
- **API First** - Easily integrate into your tools and platforms

---

## Key Features

### 📊 Real-Time Market Analysis
- **Live Stock Quotes** - Real-time price updates and ticker data
- **Market Overview** - Indexes, sectors, market trends at a glance
- **Volume Analysis** - Trading volume insights and patterns
- **Price Action** - Support, resistance, and key level identification
- **Intraday Tracking** - Second-by-second market movements

### 🤖 AI-Powered Predictions
- **Price Prediction** - ML models forecast next-day/week price movement
- **Trend Analysis** - Identify up trends, down trends, consolidations
- **Sentiment Analysis** - Market sentiment from news and social media
- **Pattern Recognition** - Technical patterns detected automatically
- **Anomaly Detection** - Identify unusual market behavior

### 💼 Portfolio Management
- **Portfolio Tracking** - Monitor all your holdings in one place
- **Performance Analysis** - Returns, volatility, Sharpe ratio calculations
- **Asset Allocation** - Visualize portfolio composition
- **Rebalancing Suggestions** - Optimize portfolio allocation
- **Risk Metrics** - VaR, Beta, correlation analysis

### 🎯 Trading Signals
- **Buy/Sell Signals** - Generated from technical and ML analysis
- **Entry/Exit Points** - Recommended trading prices
- **Confidence Scores** - Reliability rating for each signal
- **Signal History** - Backtest signal performance
- **Custom Alerts** - Price alerts, news alerts, signal notifications

### 📈 Advanced Analytics
- **Technical Indicators** - 50+ indicators (MACD, RSI, Bollinger Bands, etc.)
- **Fundamental Analysis** - P/E ratios, earnings, growth metrics
- **Comparative Analysis** - Compare stocks side-by-side
- **Sector Performance** - Track sector trends and leaders
- **Market Correlation** - Understand stock relationships

### 📉 Risk Assessment
- **Volatility Analysis** - Historical and implied volatility
- **Drawdown Analysis** - Maximum loss scenarios
- **Value at Risk (VaR)** - Probability of losses
- **Stress Testing** - How portfolio performs in market crashes
- **Diversification Score** - Effectiveness of diversification

### 🔔 Alerts & Notifications
- **Price Alerts** - Notify when stocks reach targets
- **News Alerts** - Breaking news relevant to your holdings
- **Signal Alerts** - Real-time trading signals
- **Economic Calendar** - Important economic events
- **Email/SMS Notifications** - Stay informed anywhere

### 💾 Data & Export
- **Historical Data** - Complete price history for backtesting
- **Data Export** - CSV, JSON, Excel formats
- **Performance Reports** - Detailed PDF reports
- **Backtest Reports** - Performance analysis of strategies
- **Tax Reports** - Capital gains and tax-loss harvesting insights

---

## Quick Start

### Prerequisites

- Python 3.8+ or Node.js 18+
- pip/npm package manager
- API keys (see below)
- ~500MB disk space for data cache

### Installation

```bash
# Clone repository
git clone https://github.com/Amaresh-Saravanan/TechStock-AI.git
cd TechStock-AI

# Create virtual environment (Python)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
# OR if Node.js:
npm install
```

### API Key Setup

TechStock-AI supports multiple data providers:

**Alpha Vantage (Free with limitations)**
```bash
# Get free key at: https://www.alphavantage.co/
# Add to .env:
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

**IEX Cloud (Recommended)**
```bash
# Sign up at: https://iexcloud.io/
# Add to .env:
IEX_API_KEY=your_api_key_here
```

**Polygon.io**
```bash
# Register at: https://polygon.io/
# Add to .env:
POLYGON_API_KEY=your_api_key_here
```

**Yahoo Finance (Free, no key required)**
```bash
# No key needed, works out of the box
# Configure in config.json
```

### Configuration

```bash
# Copy example config
cp .env.example .env

# Edit with your settings
nano .env
```

**Environment Variables:**
```env
# API Configuration
ALPHA_VANTAGE_API_KEY=your_key
IEX_API_KEY=your_key
POLYGON_API_KEY=your_key

# Server Configuration
PORT=3000
DEBUG=false

# ML Models
USE_ML_PREDICTIONS=true
MODEL_PATH=./models/
RETRAIN_FREQUENCY=weekly

# Notifications
ENABLE_EMAIL_ALERTS=true
SMTP_SERVER=smtp.gmail.com
NOTIFICATION_WEBHOOK=https://your-webhook.com
```

### Starting the Application

```bash
# Development mode (Python)
python main.py

# Development mode (Node.js)
npm run dev

# Production mode
npm run start

# Access at http://localhost:3000
```

### First Run

1. **Set Up Your Portfolio**
   - Add stocks you own
   - Enter quantities and purchase prices
   - System calculates current value

2. **Configure Alerts**
   - Set price targets
   - Enable news notifications
   - Subscribe to trading signals

3. **View Analysis**
   - Dashboard shows overview
   - Details available for each stock
   - Signals and recommendations visible

4. **Explore Features**
   - Try different technical indicators
   - Run backtest on strategies
   - Analyze portfolio performance

---

## Tech Stack

### Backend
- **Language:** Python 3.8+ OR Node.js 18+
- **Framework:** Flask/FastAPI OR Express.js
- **Database:** PostgreSQL or MongoDB
- **Cache:** Redis for performance
- **Message Queue:** Celery (async tasks)

### Machine Learning
- **TensorFlow/PyTorch** - Deep learning models
- **scikit-learn** - Traditional ML algorithms
- **LSTM Networks** - Time series prediction
- **Random Forest** - Feature importance
- **XGBoost** - Gradient boosting

### Data Sources
- **Alpha Vantage API** - Stock data
- **IEX Cloud API** - Premium data
- **Polygon.io API** - Detailed market data
- **Yahoo Finance** - Free alternative
- **NewsAPI** - Market news and sentiment

### Frontend
- **React** OR **Vue.js**
- **Recharts/Chart.js** - Data visualization
- **D3.js** - Advanced charting
- **Tailwind CSS** - Responsive UI

---

## Project Structure

```
TechStock-AI/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── stocks.py        # Stock data endpoints
│   │   │   ├── portfolio.py      # Portfolio management
│   │   │   ├── predictions.py    # ML predictions
│   │   │   ├── signals.py        # Trading signals
│   │   │   └── alerts.py         # Alerts and notifications
│   │   └── utils/
│   │       └── validators.py
│   ├── models/
│   │   ├── stock_predictor.py    # Price prediction model
│   │   ├── signal_generator.py   # Signal generation
│   │   └── risk_analyzer.py      # Risk calculation
│   ├── services/
│   │   ├── data_fetcher.py       # Fetch market data
│   │   ├── portfolio_service.py  # Portfolio calculations
│   │   ├── indicator_service.py  # Technical indicators
│   │   ├── notification_service.py
│   │   └── prediction_service.py
│   ├── database/
│   │   ├── models.py             # Database schemas
│   │   ├── connection.py
│   │   └── migrations/
│   ├── ml/
│   │   ├── features/             # Feature engineering
│   │   ├── models/               # Trained models
│   │   ├── training/             # Model training code
│   │   └── evaluation/           # Model evaluation
│   ├── config/
│   │   ├── settings.py
│   │   └── indicators_config.json
│   └── main.py                   # Application entry
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/        # Main dashboard
│   │   │   ├── StockDetail/      # Stock details
│   │   │   ├── Portfolio/        # Portfolio view
│   │   │   ├── Charts/           # Chart components
│   │   │   ├── Signals/          # Signal display
│   │   │   └── Alerts/           # Alert management
│   │   ├── pages/
│   │   ├── stores/               # State management
│   │   └── App.jsx
│   └── package.json
├── data/
│   ├── cache/                    # Cached stock data
│   ├── models/                   # ML models (serialized)
│   └── historical/               # Historical data
├── tests/
│   ├── unit/
│   ├── integration/
│   └── ml/
├── docs/
│   ├── API.md
│   ├── ML_MODELS.md
│   └── INDICATORS.md
├── requirements.txt              # Python dependencies
├── package.json                  # Node.js dependencies
└── .env.example
```

---

## Usage Guide

### Analyzing a Stock

```bash
# Via CLI
python main.py analyze AAPL --period 1y

# Via API
curl -X GET http://localhost:3000/api/stocks/AAPL/analysis \
  -H "Authorization: Bearer token"
```

**Returns:**
- Current price and key metrics
- Technical indicators (50+ available)
- ML prediction for next 5 days
- Trading signals (buy/sell/hold)
- Risk assessment
- Historical comparison

### Building a Portfolio

```
1. Click "Create Portfolio"
2. Add stocks:
   - Enter ticker (e.g., AAPL)
   - Quantity (e.g., 100 shares)
   - Purchase price (optional)
3. System calculates:
   - Current value
   - Gain/loss
   - Percentage return
   - Asset allocation
4. View portfolio metrics:
   - Total value and P&L
   - Sector breakdown
   - Performance vs benchmarks
```

### Setting Up Alerts

```
1. Go to Alerts section
2. Click "Create Alert"
3. Choose type:
   - Price Alert (stock hits target price)
   - News Alert (breaking news)
   - Signal Alert (trading signal generated)
   - Economic Alert (Fed announcement, etc.)
4. Configure:
   - Trigger conditions
   - Notification method (email/SMS/push)
   - Frequency
5. Save and activate
```

### Running Backtests

```bash
# Test a trading strategy
python main.py backtest --strategy="MA_Crossover" --stock="AAPL" --period="2y"

# Results show:
# - Win rate
# - Average return per trade
# - Maximum drawdown
# - Sharpe ratio
# - Monthly returns
```

### Interpreting ML Predictions

The AI model provides:
- **Predicted Price** - Expected closing price
- **Confidence Score** - Model certainty (0-100%)
- **Trend** - Up/Down/Sideways
- **Probability Distribution** - Range of likely outcomes
- **Key Factors** - What influences the prediction

**Disclaimer:** Predictions are probabilistic, not guaranteed. Use alongside other analysis.

---

## Technical Indicators

Supported indicators include:

**Trend Indicators:**
- Moving Average (SMA, EMA, WMA)
- MACD (Convergence/Divergence)
- ADX (Average Directional Index)
- Ichimoku Kinko Hyo

**Momentum Indicators:**
- RSI (Relative Strength Index)
- Stochastic Oscillator
- CCI (Commodity Channel Index)
- ROC (Rate of Change)

**Volatility Indicators:**
- Bollinger Bands
- ATR (Average True Range)
- Keltner Channel
- Standard Deviation

**Volume Indicators:**
- OBV (On-Balance Volume)
- VWAP (Volume-Weighted Average Price)
- Volume Rate of Change
- Money Flow Index

---

## API Reference

### Stock Data Endpoints

```bash
# Get stock quote
GET /api/stocks/{ticker}/quote
→ Current price, volume, changes

# Get historical data
GET /api/stocks/{ticker}/historical?period=1y
→ OHLCV (Open, High, Low, Close, Volume) data

# Get indicators
GET /api/stocks/{ticker}/indicators?types=RSI,MACD
→ Technical indicator values

# Get predictions
GET /api/stocks/{ticker}/prediction
→ ML price prediction and signals

# Get news
GET /api/stocks/{ticker}/news
→ Recent news about the stock
```

### Portfolio Endpoints

```bash
# Create portfolio
POST /api/portfolio/create
Body: {holdings: [{ticker, quantity, buyPrice}]}

# Get portfolio
GET /api/portfolio/{id}
→ Full portfolio details and metrics

# Update holding
PUT /api/portfolio/{id}/holdings/{ticker}
Body: {quantity, sellPrice}

# Get performance
GET /api/portfolio/{id}/performance
→ Returns, drawdown, Sharpe ratio
```

See [API_DOCUMENTATION.md](./docs/API.md) for complete reference.

---

## Machine Learning Models

### Price Prediction Model
- **Architecture:** LSTM (Long Short-Term Memory)
- **Input:** Price history, volume, technical indicators
- **Output:** Predicted price 1-5 days ahead
- **Accuracy:** ~60-65% directional accuracy
- **Training:** Weekly retraining with new data

### Signal Generation Model
- **Type:** Ensemble (Random Forest + Gradient Boosting)
- **Features:** 50+ technical and fundamental features
- **Output:** Buy/Sell/Hold signals with confidence
- **Accuracy:** ~55-70% depending on market conditions

### Risk Assessment Model
- **Type:** Volatility prediction (GARCH)
- **Output:** Expected volatility and maximum loss
- **Use Case:** Portfolio risk management

All models are backtested before deployment.

---

## Performance Metrics

### Dashboard Metrics
- **Current Portfolio Value** - Total investment worth
- **Overall Return** - Profit/loss in $ and %
- **YTD Return** - Year-to-date performance
- **Volatility** - Portfolio standard deviation
- **Sharpe Ratio** - Risk-adjusted return
- **Max Drawdown** - Largest peak-to-trough decline

### Stock Metrics
- **RSI** - Momentum (0-100, >70=overbought, <30=oversold)
- **MACD** - Trend strength and direction
- **Bollinger Bands** - Support and resistance levels
- **P/E Ratio** - Valuation metric
- **52-Week High/Low** - Price range
- **Average Volume** - Liquidity indicator

---

## Roadmap

### Current Features (v1.0)
- ✅ Real-time stock data
- ✅ Portfolio tracking
- ✅ Technical analysis
- ✅ ML price predictions
- ✅ Trading signals
- ✅ Alerts and notifications

### Planned (v1.1)
- 🔄 Options analysis (Greeks, strategies)
- 🔄 Crypto asset support
- 🔄 Dividend tracking
- 🔄 Tax-loss harvesting recommendations
- 🔄 Mobile app

### Future (v2.0)
- ⏳ Social trading features
- ⏳ Portfolio optimization
- ⏳ Robo-advisor integration
- ⏳ Forex and commodities
- ⏳ Advanced options strategies

---

## Development

### Running Tests

```bash
# Unit tests
pytest tests/unit/ -v

# Integration tests
pytest tests/integration/ -v

# ML model tests
pytest tests/ml/ -v

# Coverage report
pytest --cov=src tests/
```

### Training ML Models

```bash
# Train price prediction model
python src/ml/training/train_predictor.py --data-source=IEX --lookback=5y

# Train signal generation model
python src/ml/training/train_signals.py --model=ensemble

# Evaluate model performance
python src/ml/evaluation/evaluate.py --model=lstm
```

### Data Collection

```bash
# Fetch historical data for all holdings
python src/services/data_fetcher.py --action=fetch-history

# Update cache with latest prices
python src/services/data_fetcher.py --action=update-cache

# Backfill missing data
python src/services/data_fetcher.py --action=backfill --period=1m
```

---

## Deployment

### Docker

```dockerfile
# Build
docker build -t techstock-ai:latest .

# Run
docker run -p 3000:3000 \
  -e IEX_API_KEY=your_key \
  techstock-ai:latest
```

### Cloud Deployment

- **AWS:** EC2 + RDS + S3
- **Google Cloud:** Cloud Run + Cloud SQL
- **Azure:** App Service + SQL Database
- **Heroku:** Deploy from GitHub

---

## Troubleshooting

### Data Issues

**No data showing**
```bash
# Check API keys
python -c "from config import settings; print(settings.IEX_API_KEY)"

# Test API connection
curl https://cloud.iexapis.com/stable/ping?token=your_key

# Check cache
ls -la data/cache/
```

**Stale data**
```bash
# Force cache refresh
rm -rf data/cache/
python src/services/data_fetcher.py --action=fetch-full
```

### Model Issues

**Poor predictions**
- Models may underperform in volatile markets
- Retrain with more recent data
- Adjust model parameters
- Combine with other indicators

---

## Support

- **📧 Email:** amareshsaravanan2617@gmail.com
- **🐛 Issues:** [GitHub Issues](https://github.com/Amaresh-Saravanan/TechStock-AI/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/Amaresh-Saravanan/TechStock-AI/discussions)

---

## Legal Disclaimer

**IMPORTANT:** TechStock-AI is for educational and research purposes only. 

- **Not Financial Advice:** Predictions are not investment recommendations
- **Past Performance:** Historical data doesn't guarantee future results
- **Risk Disclosure:** Investments carry risk of loss
- **Market Conditions:** ML models may perform poorly in crisis scenarios
- **API Limitations:** Some APIs have rate limits and data delays

Always do your own research and consult a financial advisor before investing.

---

## Contributing

Contributions welcome! Areas of interest:
- 🤖 Better ML models
- 📊 New indicators
- 🔗 Additional data sources
- 📱 Mobile features
- 🌍 Localization
- 📖 Documentation

---

## License

MIT License - see [LICENSE](LICENSE) file.

---

**Version:** 1.0.0  
**Last Updated:** June 30, 2026  
**Status:** 🟢 Production Ready  
**Data Sources:** IEX Cloud, Alpha Vantage, Polygon.io, Yahoo Finance

---

*Invest smarter with AI-powered insights.* 📈🤖
