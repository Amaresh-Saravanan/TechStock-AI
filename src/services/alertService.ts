// Re-export Alert type from analyticsService for use across pages
export type { Alert } from './analyticsService';
import api from './api';
import type { Alert } from './analyticsService';

export const alertService = {
  async getAlerts(): Promise<Alert[]> {
    const res = await api.get<Alert[]>('/api/alerts/');
    return res.data;
  },
};
