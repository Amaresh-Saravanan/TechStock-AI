import axios, { AxiosError, AxiosResponse } from 'axios';

// Create a configured axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Adjust base URL as needed
  withCredentials: true, // Needed to attach the HttpOnly cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup response interceptor for global error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const originalRequest = error.config;
    // Check if the response indicates authentication failure
    // Ignore 401s from expected auth endpoints to avoid triggering "session expired" on failed logins
    if (
      error.response?.status === 401 && 
      originalRequest && 
      !originalRequest.url?.includes('/auth/login') && 
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/me')
    ) {
      // Dispatch a custom event that the AuthContext will listen to
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    
    return Promise.reject(error);
  }
);
