import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe, Query, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';
import { AssignMentorDto } from './dto/assign-mentor.dto';
import { AnalyticsService } from './services/analytics.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('/me')
  me(@ActiveUserId() userId: string) {
    return this.usersService.getUserById(userId);
  }

  @Get('/mentorados')
  getMentorados(@ActiveUserId() userId: string) {
    return this.usersService.getMentorados(userId);
  }

  @Get('/available-for-assignment')
  getAvailableUsers(@ActiveUserId() userId: string) {
    return this.usersService.getAllUsersForAssignment(userId);
  }

  @Post('/mentorados')
  assignMentor(
    @ActiveUserId() userId: string,
    @Body() assignMentorDto: AssignMentorDto,
  ) {
    return this.usersService.assignMentor(
      userId,
      assignMentorDto.mentoradoId,
      assignMentorDto.permission,
    );
  }

  @Delete('/mentorados/:mentoradoId')
  removeMentor(
    @ActiveUserId() userId: string,
    @Param('mentoradoId', ParseUUIDPipe) mentoradoId: string,
  ) {
    return this.usersService.removeMentor(userId, mentoradoId);
  }

  @Get('/analytics/mentorados')
  getMentoradosAnalytics(
    @ActiveUserId() userId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.analyticsService.getMentoradosAnalytics(userId, month, year);
  }
}
