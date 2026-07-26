import api from './api';

export interface SaleRecord {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  brand: string;
  quantity: number;
  sold_price: number;
  purchase_price: number;
  profit: number;
  profit_margin: number;
  customer_name: string;
  customer_phone: string;
  sold_at: string;
}

export interface RecordSalePayload {
  product_id: string;
  quantity: number;
  sold_price: number;
  customer_name?: string;
  customer_phone?: string;
}

export interface SalesHistoryResponse {
  sales: SaleRecord[];
  total_revenue: number;
  total_profit: number;
  avg_margin: number;
  monthly_revenue: { month: string; revenue: number; profit: number }[];
  category_breakdown: { category: string; revenue: number }[];
  top_sellers: { name: string; total_sold: number; revenue: number }[];
}

export interface PriceSuggestion {
  suggested_price: number;
  competitor_avg: number;
  margin_at_suggested: number;
  reasoning: string;
}

export const salesService = {
  async getSalesHistory(): Promise<SalesHistoryResponse> {
    const res = await api.get<SalesHistoryResponse>('/api/sales-history/');
    return res.data;
  },

  async recordSale(payload: RecordSalePayload): Promise<SaleRecord> {
    const res = await api.post<SaleRecord>('/api/sales/', payload);
    return res.data;
  },

  async suggestPrice(productId: string): Promise<PriceSuggestion> {
    const res = await api.get<PriceSuggestion>(`/api/sales/suggest-price/${productId}/`);
    return res.data;
  },
};
