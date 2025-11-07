import { getAll } from './getAll';
import { countUnread } from './countUnread';
import { markAsRead } from './markAsRead';
import { markAllAsRead } from './markAllAsRead';
import { remove } from './remove';

export const notificationsService = {
  getAll,
  countUnread,
  markAsRead,
  markAllAsRead,
  remove,
};


