import { httpClient } from '../httpClient';

export async function remove(notificationId: string): Promise<void> {
  await httpClient.delete(`/notifications/${notificationId}`);
}


