import { httpClient } from '../httpClient';
import { User } from '../../entities/user';

type RemoveMentorResponse = User;

export async function removeMentor(mentoradoId: string) {
  const { data } = await httpClient.delete<RemoveMentorResponse>(`/users/mentorados/${mentoradoId}`);

  return data;
}


