import { httpClient } from '../httpClient';

export async function countUnread(): Promise<number> {
  const { data } = await httpClient.get<{ count: number }>('/notifications/unread/count');
  
  return data.count;
}

