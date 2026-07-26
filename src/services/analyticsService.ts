import api from './api';

export interface DashboardStat {
  total_inventory_value: number;
  total_items: number;
  monthly_revenue: number;
  monthly_profit: number;
  avg_margin: number;
  dead_stock_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface AIInsight {
  product_name: string;
  action: string;
  reason: string;
  confidence: number;
  potential_value: number;
}

export interface Recommendation {
  id: string;
  type: 'dead_stock' | 'restock' | 'opportunity' | 'pricing';
  product_name: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  opportunity_score: number;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'dead_stock' | 'price_drop' | 'out_of_stock';
  product_name: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  created_at: string;
}

export interface DashboardResponse {
  stats: DashboardStat;
  ai_insight: AIInsight | null;
  recommendations: Recommendation[];
  alerts: Alert[];
  recent_sales: { date: string; revenue: number; profit: number }[];
  category_distribution: { category: string; value: number; count: number }[];
}

export interface AnalyticsResponse {
  monthly_revenue: { month: string; revenue: number; profit: number }[];
  category_breakdown: { category: string; revenue: number; profit: number; count: number }[];
  top_sellers: { name: string; total_sold: number; revenue: number; margin: number }[];
  profit_trend: { date: string; profit: number }[];
}

export const analyticsService = {
  async getDashboard(): Promise<DashboardResponse> {
    const res = await api.get<DashboardResponse>('/api/analytics/dashboard/');
    return res.data;
  },

  async getAnalytics(): Promise<AnalyticsResponse> {
    const res = await api.get<AnalyticsResponse>('/api/analytics/');
    return res.data;
  },

  async getRecommendations(): Promise<Recommendation[]> {
    const res = await api.get<Recommendation[]>('/api/recommendations/');
    return res.data;
  },

  async getAlerts(): Promise<Alert[]> {
    const res = await api.get<Alert[]>('/api/alerts/');
    return res.data;
  },
};
