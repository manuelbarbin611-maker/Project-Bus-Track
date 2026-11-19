import { api } from '@app/lib/api';
import type { ApiResponse, Passenger } from '@app/types';

export async function getPassengers(params?: {
  status?: 'waiting' | 'onboarded' | 'cancelled';
  bus_id?: number;
  search?: string;
}): Promise<ApiResponse<Passenger[]>> {
  const queryString = params
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
      ).toString()
    : '';
  return await api.get(`/api/passengers${queryString}`);
}

export async function getPassenger(passengerId: number): Promise<ApiResponse<Passenger>> {
  return await api.get(`/api/passengers/${passengerId}`);
}

export async function createPassenger(data: {
  first_name: string;
  last_name: string;
  status?: 'waiting' | 'onboarded' | 'cancelled';
  assigned_bus_id?: number;
}): Promise<ApiResponse<Passenger>> {
  return await api.post('/api/passengers', data);
}

export async function updatePassenger(passengerId: number, data: {
  first_name?: string;
  last_name?: string;
}): Promise<ApiResponse<Passenger>> {
  return await api.put(`/api/passengers/${passengerId}`, data);
}

export async function deletePassenger(passengerId: number): Promise<ApiResponse<Passenger>> {
  return await api.del(`/api/passengers/${passengerId}`);
}

export async function updatePassengerStatus(
  passengerId: number,
  status: 'waiting' | 'onboarded' | 'cancelled'
): Promise<ApiResponse<Passenger>> {
  return await api.patch(`/api/passengers/${passengerId}/status`, { status });
}

export async function assignPassengerToBus(
  passengerId: number,
  busId: number | null
): Promise<ApiResponse<Passenger>> {
  return await api.patch(`/api/passengers/${passengerId}/assign`, { bus_id: busId });
}
