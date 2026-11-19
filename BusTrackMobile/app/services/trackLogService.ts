import { api } from '@app/lib/api';
import type { ApiResponse, LiveBusData, PaginatedResponse, TrackLog } from '@app/types';

export async function getBusLogs(busId: number, date?: string): Promise<PaginatedResponse<TrackLog>> {
  const params = date ? `?date=${date}` : '';
  return await api.get(`/api/buses/${busId}/logs${params}`);
}

export async function getBusLatestLog(busId: number): Promise<ApiResponse<TrackLog>> {
  return await api.get(`/api/buses/${busId}/logs/latest`);
}

export async function getLiveBuses(): Promise<ApiResponse<LiveBusData[]>> {
  return await api.get('/api/live');
}

export async function createTrackLog(busId: number, data: {
  stop_id?: number;
  stop_name?: string;
  latitude?: number;
  longitude?: number;
}): Promise<ApiResponse<TrackLog>> {
  return await api.post(`/api/buses/${busId}/logs`, data);
}

export async function sendLocationBatch(busId: number, locations: Array<{
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  stop_id?: number;
  stop_name?: string;
}>): Promise<ApiResponse<{ message: string; count: number }>> {
  return await api.post('/api/locations/batch', { bus_id: busId, locations });
}
