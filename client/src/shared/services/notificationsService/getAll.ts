import { httpClient } from '../httpClient';
import { Notification } from '../../entities/notification';

interface GetAllNotificationsParams {
  read?: boolean;
}

export async function getAll(params?: GetAllNotificationsParams): Promise<Notification[]> {
  const { data } = await httpClient.get<Notification[]>('/notifications', {
    params,
  });

  return data;
}


