import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum MentorPermission {
  READ_ONLY = 'READ_ONLY',
  FULL_ACCESS = 'FULL_ACCESS',
}

export class AssignMentorDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  mentoradoId: string;

  @IsEnum(MentorPermission)
  @IsOptional()
  permission?: MentorPermission;
}

