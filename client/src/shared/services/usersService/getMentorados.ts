import { httpClient } from '../httpClient';
import { User } from '../../entities/user';

type MentoradosResponse = Array<User>;

export async function getMentorados() {
  const { data } = await httpClient.get<MentoradosResponse>('/users/mentorados');

  return data;
}


