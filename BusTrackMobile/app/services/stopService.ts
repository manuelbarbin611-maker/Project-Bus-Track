import { api } from '@app/lib/api';
import type { ApiResponse, Stop } from '@app/types';

export async function getRouteStops(routeId: number): Promise<ApiResponse<Stop[]>> {
  return await api.get(`/api/routes/${routeId}/stops`);
}

export async function getStop(stopId: number): Promise<ApiResponse<Stop>> {
  return await api.get(`/api/stops/${stopId}`);
}

export async function updateStop(
  stopId: number,
  data: {
    stop_name?: string;
    stop_order?: number;
    latitude?: number;
    longitude?: number;
  }
): Promise<ApiResponse<Stop>> {
  return await api.put(`/api/stops/${stopId}`, data);
}

export async function deleteStop(stopId: number): Promise<ApiResponse<Stop>> {
  return await api.del(`/api/stops/${stopId}`);
}
