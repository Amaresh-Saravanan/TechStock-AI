import api from './api';

export interface CompetitorPrice {
  amazon: number | null;
  flipkart: number | null;
  mdcomputers: number | null;
  primeabgb: number | null;
}

export interface PriceTrackingItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  our_price: number;
  competitor_prices: CompetitorPrice;
  market_avg: number;
  price_status: 'Higher' | 'Lower' | 'Optimal';
  recommended_price: number;
  potential_margin: number;
}

export interface PriceHistoryPoint {
  date: string;
  our_price: number;
  amazon: number | null;
  flipkart: number | null;
  mdcomputers: number | null;
  primeabgb: number | null;
}

export interface PricePrediction {
  product_id: string;
  product_name: string;
  historical: { month: string; price: number }[];
  predicted: { month: string; price: number }[];
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  recommendation: string;
}

export interface PriceSuggestionItem {
  id: string;
  name: string;
  category: string;
  current_price: number;
  suggested_price: number;
  action: 'sell_now' | 'hold' | 'restock';
  reason: string;
  urgency: 'high' | 'medium' | 'low';
}

export const priceService = {
  async getPriceTracking(): Promise<PriceTrackingItem[]> {
    const res = await api.get<PriceTrackingItem[]>('/api/price-tracking/');
    return res.data;
  },

  async getPriceHistory(productId: string): Promise<PriceHistoryPoint[]> {
    const res = await api.get<PriceHistoryPoint[]>(`/api/price-history/${productId}/`);
    return res.data;
  },

  async getPricePrediction(productId: string): Promise<PricePrediction> {
    const res = await api.get<PricePrediction>(`/api/price-prediction/${productId}/`);
    return res.data;
  },

  async getPriceSuggestions(): Promise<PriceSuggestionItem[]> {
    const res = await api.get<PriceSuggestionItem[]>('/api/price-suggestions/');
    return res.data;
  },
};
