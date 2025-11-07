import { httpClient } from '../httpClient';
import { User } from '../../entities/user';

type AvailableUsersResponse = Array<User & { mentorId?: string | null }>;

export async function getAvailableUsers() {
  const { data } = await httpClient.get<AvailableUsersResponse>('/users/available-for-assignment');

  return data;
}


