import { api } from './api';

type LoginResponse = { access_token?: string; token?: string; user?: any; [k: string]: any };

async function saveTokenFromResponse(data: any) {
  const token = data?.access_token || data?.token || data?.accessToken || data?.meta?.token;
  if (token) await api.saveToken(token);
  return token;
}

export async function loginRequest(email: string, password: string) {
  const data = await api.post('/api/auth/login', { email, password });
  await saveTokenFromResponse(data);
  return data as LoginResponse;
}

export async function registerRequest(payload: any) {
  const data = await api.post('/api/auth/register', payload);
  await saveTokenFromResponse(data);
  return data as LoginResponse;
}

export async function logoutRequest() {
  try {
    await api.post('/api/auth/logout');
  } finally {
    await api.removeToken();
  }
}

export async function getCurrentUser() {
  return await api.get('/api/auth/me');
}
