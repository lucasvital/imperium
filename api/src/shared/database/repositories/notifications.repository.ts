import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { type Prisma } from '@prisma/client';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDto: Prisma.NotificationCreateArgs) {
    return this.prismaService.notification.create(createDto);
  }

  update(updateDto: Prisma.NotificationUpdateArgs) {
    return this.prismaService.notification.update(updateDto);
  }

  delete(deleteDto: Prisma.NotificationDeleteArgs) {
    return this.prismaService.notification.delete(deleteDto);
  }

  findMany(findManyDto: Prisma.NotificationFindManyArgs) {
    return this.prismaService.notification.findMany(findManyDto);
  }

  findFirst(findFirstDto: Prisma.NotificationFindFirstArgs) {
    return this.prismaService.notification.findFirst(findFirstDto);
  }

  findUnique(findUniqueDto: Prisma.NotificationFindUniqueArgs) {
    return this.prismaService.notification.findUnique(findUniqueDto);
  }

  count(countDto: Prisma.NotificationCountArgs) {
    return this.prismaService.notification.count(countDto);
  }

  updateMany(updateManyDto: Prisma.NotificationUpdateManyArgs) {
    return this.prismaService.notification.updateMany(updateManyDto);
  }
}


