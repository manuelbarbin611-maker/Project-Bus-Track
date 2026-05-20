import { API_BASE_URL } from './config';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'bustrack_token';

async function getAuthHeader() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const authHeader = await getAuthHeader();
  Object.assign(headers, authHeader);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw { status: res.status, data };
    return data;
  } catch (err: any) {
    // non-json response or thrown error
    if (err && err.status) throw err;
    throw { status: res.status, data: text };
  }
}

export const api = {
  get: (path: string) => request(path, { method: 'GET' }),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path: string) => request(path, { method: 'DELETE' }),
  TOKEN_KEY,
  async saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async removeToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
  async getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
};
