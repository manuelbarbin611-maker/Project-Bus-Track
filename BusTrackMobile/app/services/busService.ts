import { api } from '@app/lib/api';

export async function getBuses() {
  return await api.get('/api/buses');
}

export async function getBus(busId: number) {
  return await api.get(`/api/buses/${busId}`);
}

export async function updateBusStatus(busId: number, status: 'active' | 'inactive' | 'maintenance') {
  return await api.patch(`/api/buses/${busId}/status`, { status });
}

export async function updateBusStop(busId: number, stopId: number | null, latitude?: number, longitude?: number) {
  return await api.patch(`/api/buses/${busId}/stop`, { stop_id: stopId, latitude, longitude });
}
