import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

def predict_future_price(prices):
    """
    Prices should be a list of dicts: [{'day': 1, 'price': 100}, ...]
    Returns predicted price for day len(prices) + 1
    """
    if len(prices) < 3:
        return prices[-1]['price'] if prices else 0
        
    X = np.array([p['day'] for p in prices]).reshape(-1, 1)
    y = np.array([p['price'] for p in prices])
    
    poly = PolynomialFeatures(degree=2)
    X_poly = poly.fit_transform(X)
    
    model = LinearRegression()
    model.fit(X_poly, y)
    
    next_day = np.array([[len(prices) + 1]])
    next_day_poly = poly.transform(next_day)
    return round(float(model.predict(next_day_poly)[0]), 2)
