import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from 'src/shared/database/repositories/notifications.repository';

@Injectable()
export class ValidateNotificationOwnershipService {
  constructor(private readonly notificationsRepo: NotificationsRepository) {}

  async validate(userId: string, notificationId: string) {
    const notification = await this.notificationsRepo.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found.');
    }

    return notification;
  }
}


