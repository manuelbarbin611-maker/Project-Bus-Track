import { api } from '@app/lib/api';

export async function getBusQueue(busId: number) {
  return await api.get(`/api/buses/${busId}/queue`);
}
