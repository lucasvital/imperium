import { me } from './me';
import { getMentorados } from './getMentorados';
import { getAvailableUsers } from './getAvailableUsers';
import { assignMentor } from './assignMentor';
import { removeMentor } from './removeMentor';
import { getMentoradosAnalytics } from './getMentoradosAnalytics';

export const usersService = {
  me,
  getMentorados,
  getAvailableUsers,
  assignMentor,
  removeMentor,
  getMentoradosAnalytics
};
