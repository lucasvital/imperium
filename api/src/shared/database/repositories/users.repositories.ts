import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { type Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createUserDto: Prisma.UserCreateArgs) {
    return this.prismaService.user.create(createUserDto);
  }

  findUnique(findUniqueDto: Prisma.UserFindUniqueArgs) {
    return this.prismaService.user.findUnique(findUniqueDto);
  }

  findMany<T extends Prisma.UserFindManyArgs>(
    findManyDto: Prisma.SelectSubset<T, Prisma.UserFindManyArgs>,
  ) {
    return this.prismaService.user.findMany(findManyDto);
  }

  update(updateDto: Prisma.UserUpdateArgs) {
    return this.prismaService.user.update(updateDto);
  }
}
