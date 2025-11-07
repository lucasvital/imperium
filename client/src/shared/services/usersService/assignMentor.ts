import { httpClient } from '../httpClient';
import { User } from '../../entities/user';

export interface AssignMentorParams {
  mentoradoId: string;
  permission?: 'READ_ONLY' | 'FULL_ACCESS';
}

type AssignMentorResponse = User & { mentorPermission?: 'READ_ONLY' | 'FULL_ACCESS' };

export async function assignMentor(params: AssignMentorParams) {
  const { data } = await httpClient.post<AssignMentorResponse>('/users/mentorados', params);

  return data;
}

