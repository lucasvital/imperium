import { httpClient } from '../httpClient';

export async function markAllAsRead(): Promise<void> {
  await httpClient.put('/notifications/read-all');
}


