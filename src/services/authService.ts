import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  store_name: string;
  role: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  store_name: string;
  store_id: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await api.post<TokenResponse>('/api/auth/token/', { email, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    return res.data.user;
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await api.post<TokenResponse>('/api/auth/register/', payload);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    return res.data.user;
  },

  async getMe(): Promise<AuthUser> {
    const res = await api.get<AuthUser>('/api/auth/me/');
    return res.data;
  },

  async refreshToken(): Promise<string> {
    const refresh = localStorage.getItem('refresh_token');
    const res = await api.post<{ access: string }>('/api/auth/token/refresh/', { refresh });
    localStorage.setItem('access_token', res.data.access);
    return res.data.access;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
