import api from './api';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  last_sold_days: number;
  demand_score: number;
  total_sold: number;
  created_at: string;
  updated_at: string;
}

export interface AddItemPayload {
  name: string;
  category: string;
  brand: string;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  last_sold_days?: number;
}

export const inventoryService = {
  async getInventory(): Promise<InventoryItem[]> {
    const res = await api.get<InventoryItem[]>('/api/inventory/');
    return res.data;
  },

  async getItem(id: string): Promise<InventoryItem> {
    const res = await api.get<InventoryItem>(`/api/inventory/${id}/`);
    return res.data;
  },

  async addItem(payload: AddItemPayload): Promise<InventoryItem> {
    const res = await api.post<InventoryItem>('/api/inventory/', payload);
    return res.data;
  },

  async updateItem(id: string, payload: Partial<AddItemPayload>): Promise<InventoryItem> {
    const res = await api.patch<InventoryItem>(`/api/inventory/${id}/`, payload);
    return res.data;
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/api/inventory/${id}/`);
  },
};
