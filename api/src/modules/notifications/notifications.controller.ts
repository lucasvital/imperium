import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';
import { OptionalParseBoolPipe } from 'src/shared/pipes/OptionalParseBoolPipe';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(userId, createNotificationDto);
  }

  @Get()
  findAll(
    @ActiveUserId() userId: string,
    @Query('read', OptionalParseBoolPipe) read?: boolean,
  ) {
    return this.notificationsService.findAllByUserId(userId, { read });
  }

  @Get('unread/count')
  countUnread(@ActiveUserId() userId: string) {
    return this.notificationsService.countUnread(userId).then((count) => ({
      count,
    }));
  }

  @Put(':notificationId/read')
  markAsRead(
    @ActiveUserId() userId: string,
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @Put('read-all')
  markAllAsRead(@ActiveUserId() userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':notificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @ActiveUserId() userId: string,
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
  ) {
    return this.notificationsService.remove(userId, notificationId);
  }
}

