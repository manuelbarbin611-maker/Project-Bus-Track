import { api } from '@app/lib/api';
import type { ApiResponse, Route } from '@app/types';

export async function getRoutes(): Promise<ApiResponse<Route[]>> {
  return await api.get('/api/routes');
}

export async function getRoute(routeId: number): Promise<ApiResponse<Route>> {
  return await api.get(`/api/routes/${routeId}`);
}

export async function createRoute(data: {
  name: string;
  description?: string;
  status?: 'draft' | 'active';
}): Promise<ApiResponse<Route>> {
  return await api.post('/api/routes', data);
}

export async function updateRoute(routeId: number, data: {
  name: string;
  description?: string;
  status: 'draft' | 'active';
}): Promise<ApiResponse<Route>> {
  return await api.put(`/api/routes/${routeId}`, data);
}

export async function deleteRoute(routeId: number): Promise<ApiResponse<Route>> {
  return await api.del(`/api/routes/${routeId}`);
}
