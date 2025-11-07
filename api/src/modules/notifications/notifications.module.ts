import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './notifications.controller';
import { ValidateNotificationOwnershipService } from './services/validate-notification-ownership.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, ValidateNotificationOwnershipService],
  exports: [NotificationsService],
})
export class NotificationsModule {}


