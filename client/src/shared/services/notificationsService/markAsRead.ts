import { httpClient } from '../httpClient';
import { Notification } from '../../entities/notification';

export async function markAsRead(notificationId: string): Promise<Notification> {
  const { data } = await httpClient.put<Notification>(`/notifications/${notificationId}/read`);

  return data;
}


