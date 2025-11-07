export interface User {
  id: string;

  name: string;

  role?: 'USER' | 'ADMIN';

  mentorPermission?: 'READ_ONLY' | 'FULL_ACCESS';
}
