import axios from 'axios';
import { setAccessToken, logout } from '../store/authSlice';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true, // refresh token cookie
  timeout: 30000,
});

// The store is injected after creation to avoid a circular import between
// store.js -> (slices) -> api.js -> store.js.
let storeRef = null;
export function injectStore(store) {
  storeRef = store;
}

api.interceptors.request.use((config) => {
  const token = storeRef?.getState()?.auth?.accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (status === 401 && !originalRequest._retry && !isAuthRoute && storeRef) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }
        const { data } = await refreshPromise;
        const newToken = data?.data?.accessToken;
        if (newToken) {
          storeRef.dispatch(setAccessToken(newToken));
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        storeRef.dispatch(logout());
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

/**
 * Unwraps the standard { success, message, data } envelope.
 * Throws a normalized Error with .fieldErrors and .message on failure.
 */
export function unwrap(promise) {
  return promise
    .then((res) => res.data)
    .catch((err) => {
      const payload = err.response?.data;
      const message = payload?.message || err.message || 'Request failed';
      const normalized = new Error(message);
      normalized.fieldErrors = payload?.errors || [];
      normalized.status = err.response?.status;
      throw normalized;
    });
}
