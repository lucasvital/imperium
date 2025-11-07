import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from 'src/shared/database/repositories/notifications.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepo: NotificationsRepository,
  ) {}

  async create(userId: string, createNotificationDto: CreateNotificationDto) {
    return this.notificationsRepo.create({
      data: {
        userId,
        type: createNotificationDto.type,
        message: createNotificationDto.message,
        budgetId: createNotificationDto.budgetId || null,
      },
      include: {
        budget: {
          select: {
            id: true,
            categoryId: true,
            month: true,
            year: true,
            limit: true,
          },
        },
      },
    });
  }

  async findAllByUserId(userId: string, filters?: { read?: boolean }) {
    return this.notificationsRepo.findMany({
      where: {
        userId,
        read: filters?.read,
      },
      include: {
        budget: {
          select: {
            id: true,
            categoryId: true,
            month: true,
            year: true,
            limit: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    // Verificar se a notificação pertence ao usuário
    const notification = await this.notificationsRepo.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found.');
    }

    return this.notificationsRepo.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.notificationsRepo.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  async remove(userId: string, notificationId: string) {
    // Verificar se a notificação pertence ao usuário
    const notification = await this.notificationsRepo.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error('Notification not found.');
    }

    await this.notificationsRepo.delete({
      where: { id: notificationId },
    });

    return null;
  }

  async countUnread(userId: string) {
    return this.notificationsRepo.count({
      where: {
        userId,
        read: false,
      },
    });
  }
}


