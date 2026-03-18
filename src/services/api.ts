// API Service for TechStock AI Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface DashboardStats {
  totalInventoryValue: number;
  totalInventoryValueFormatted: string;
  monthlyProfit: number;
  monthlyProfitFormatted: string;
  deadStockCount: number;
  lowStockCount: number;
  alertsCount: number;
}

export interface AIInsight {
  product: string;
  productId: string;
  profit: number;
  profitFormatted: string;
  demandLevel: 'Peak' | 'High' | 'Medium' | 'Low';
  supplyLevel: 'Critical' | 'Low' | 'Adequate';
  confidenceScore: number;
  insight: string;
  surgePct: number;
}

export interface Recommendation {
  productId: string;
  product: string;
  action: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
}

export interface Alert {
  id: string;
  productId: string;
  productName: string;
  type: 'dead_stock' | 'low_stock' | 'price_drop';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DashboardResponse {
  stats: DashboardStats;
  aiInsight: AIInsight | null;
  recommendations: Recommendation[];
  alerts: Alert[];
  lastUpdated: string;
}

export interface DemandInfo {
  score: number;
  level: 'Peak' | 'High' | 'Medium' | 'Low';
  trend: 'rising' | 'stable' | 'declining';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  lastSoldDays: number;
  demandScore: number;
  profitMargin: number;
  demand: DemandInfo;
  status: 'Dead Stock' | 'Low Stock' | 'In Stock';
}

export interface InventoryResponse {
  items: InventoryItem[];
  summary: {
    totalItems: number;
    totalValue: number;
    avgProfitMargin: number;
  };
}

export interface PricePrediction {
  historical: number[];
  predicted: number[];
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

export interface PricePredictionResponse {
  product: string;
  currentPrice: number;
  prediction: PricePrediction;
  competitors: Record<string, number>;
  recommendation: string;
}

export interface SalesTrend {
  month: string;
  revenue: number;
  profit: number;
  profitMargin: number;
}

export interface CategoryData {
  name: string;
  value: number;
  amount: number;
}

export interface AnalyticsResponse {
  salesTrend: SalesTrend[];
  categoryDistribution: CategoryData[];
  profitByCategory: {
    category: string;
    profit: number;
    margin: number;
  }[];
  summary: {
    totalRevenue: number;
    totalProfit: number;
    avgMargin: number;
  };
}

// Price Tracking Types
export interface PriceTrackingItem {
  id: string;
  productName: string;
  category: string;
  purchasePrice: number;
  yourPrice: number;
  competitorAvg: number;
  amazon?: number;
  flipkart?: number;
  mdcomputers?: number;
  primeabgb?: number;
  recommendedPrice: number;
  profitMargin: number;
  priceStatus: 'Higher' | 'Lower' | 'Optimal';
  priceStatusColor: 'red' | 'yellow' | 'green';
  quantity: number;
  lastSoldDays: number;
  demandScore: number;
}

export interface PriceTrackingResponse {
  products: PriceTrackingItem[];
  lastUpdated: string;
}

export interface PriceHistoryEntry {
  date: string;
  yourPrice: number;
  competitorAvg: number;
  amazon?: number;
  flipkart?: number;
  mdcomputers?: number;
}

export interface PriceHistoryResponse {
  productId: string;
  productName: string;
  history: PriceHistoryEntry[];
  summary: {
    avgYourPrice: number;
    avgCompetitorPrice: number;
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export interface PricePredictionDetailedResponse {
  productId: string;
  productName: string;
  currentAvgPrice: number;
  predictedPrice: number;
  predictedChangePercent: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  predictions: {
    days: number;
    predictedPrice: number;
    confidence: number;
  }[];
  factors: {
    factor: string;
    impact: string;
  }[];
  confidence: number;
}

export interface PriceSuggestion {
  product: string;
  type: 'sell' | 'restock' | 'price_reduce';
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BestProduct {
  product: string;
  productId: string;
  profitMargin: number;
  demandScore: number;
  currentStock: number;
  yourPrice?: number;
  competitorAvg?: number;
  priceAdvantage?: number;
}

export interface PriceSuggestionsResponse {
  bestToSell: BestProduct | null;
  bestToStock: BestProduct | null;
  suggestions: PriceSuggestion[];
  aiInsight: {
    title: string;
    message: string;
    recommendation: string;
  };
  generatedAt: string;
}

// Sales Types
export interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  category?: string;
  brand?: string;
  quantity: number;
  soldPrice: number;
  purchasePrice: number;
  profit: number;
  profitMargin?: number;
  customerName: string;
  customerPhone: string;
  soldAt: string;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalProfit: number;
  totalItemsSold: number;
  averageProfit: number;
  totalTransactions: number;
}

export interface CategorySales {
  count: number;
  revenue: number;
  profit: number;
}

export interface TopSellingProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface SalesHistoryResponse {
  sales: SaleRecord[];
  analytics: SalesAnalytics;
  categorySales: Record<string, CategorySales>;
  topSelling: TopSellingProduct[];
}

export interface SalePriceMarginOption {
  margin: number;
  price: number;
  profit: number;
}

export interface SalePriceSuggestionResponse {
  productId: string;
  productName: string;
  purchasePrice: number;
  currentSellingPrice: number;
  demandScore: number;
  competitorAvg: number;
  competitorRange: { min: number; max: number };
  aiSuggestedPrice: number;
  aiProfitAmount: number;
  aiProfitMargin: number;
  suggestionReason: string;
  marginOptions: SalePriceMarginOption[];
  recommendation: string;
}

export interface RecordSalePayload {
  productId: string;
  quantity: number;
  soldPrice: number;
  customerName: string;
  customerPhone: string;
}

export interface RecordSaleResponse {
  success: boolean;
  message: string;
  sale: SaleRecord;
  remainingStock: number;
}

// API Functions with fast timeout
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function postAPI<T>(endpoint: string, data: unknown): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function putAPI<T>(endpoint: string, data: unknown): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function deleteAPI<T>(endpoint: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const api = {
  // Health check
  health: () => fetchAPI<{ status: string; timestamp: string }>('/health'),
  
  // Dashboard
  getDashboard: () => fetchAPI<DashboardResponse>('/dashboard'),
  
  // Inventory
  getInventory: () => fetchAPI<InventoryResponse>('/inventory'),
  
  addInventoryItem: (data: Partial<InventoryItem>) => 
    postAPI<{ success: boolean; item: InventoryItem }>('/inventory', data),
    
  updateInventoryItem: (id: string, data: Partial<InventoryItem>) => 
    putAPI<{ success: boolean; item: InventoryItem }>(`/inventory/${id}`, data),
    
  deleteInventoryItem: (id: string) => 
    deleteAPI<{ success: boolean }>(`/inventory/${id}`),
  
  // Price predictions
  getPricePrediction: (productId: string) => 
    fetchAPI<PricePredictionResponse>(`/predictions/price/${productId}`),
  
  // Recommendations
  getRecommendations: () => fetchAPI<{
    topInsight: AIInsight | null;
    recommendations: Recommendation[];
    generatedAt: string;
  }>('/recommendations'),
  
  // Alerts
  getAlerts: () => fetchAPI<{
    alerts: Alert[];
    summary: {
      total: number;
      unread: number;
      critical: number;
    };
  }>('/alerts'),
  
  // Analytics
  getAnalytics: () => fetchAPI<AnalyticsResponse>('/analytics'),

  // Price Tracking APIs
  getPriceTracking: () => fetchAPI<PriceTrackingResponse>('/price-tracking'),
  
  getPriceHistory: (productId: string) => 
    fetchAPI<PriceHistoryResponse>(`/price-history/${productId}`),
  
  getPricePredictionDetailed: (productId: string) => 
    fetchAPI<PricePredictionDetailedResponse>(`/price-prediction/${productId}`),
  
  getPriceSuggestions: () => fetchAPI<PriceSuggestionsResponse>('/price-suggestions'),

  // Sales APIs
  recordSale: (data: RecordSalePayload) => 
    postAPI<RecordSaleResponse>('/sales', data),
  
  getSalesHistory: () => fetchAPI<SalesHistoryResponse>('/sales-history'),
  
  getSalePriceSuggestion: (productId: string) => 
    fetchAPI<SalePriceSuggestionResponse>(`/sales/suggest-price/${productId}`),
};

// React Query hooks helpers
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  inventory: ['inventory'] as const,
  pricePrediction: (productId: string) => ['pricePrediction', productId] as const,
  recommendations: ['recommendations'] as const,
  alerts: ['alerts'] as const,
  analytics: ['analytics'] as const,
  priceTracking: ['priceTracking'] as const,
  priceHistory: (productId: string) => ['priceHistory', productId] as const,
  pricePredictionDetailed: (productId: string) => ['pricePredictionDetailed', productId] as const,
  priceSuggestions: ['priceSuggestions'] as const,
  salesHistory: ['salesHistory'] as const,
  salePriceSuggestion: (productId: string) => ['salePriceSuggestion', productId] as const,
};

export default api;
