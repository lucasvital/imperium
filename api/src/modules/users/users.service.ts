import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from 'src/shared/database/repositories/users.repositories';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async getUserById(userId: string) {
    return this.usersRepo.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        id: true,
        role: true,
        mentorPermission: true,
      },
    });
  }

  async getMentorados(adminId: string) {
    // Verificar se o usuário é admin
    const admin = await this.usersRepo.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (admin?.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access mentorados.');
    }

    return this.usersRepo.findMany({
      where: {
        mentorId: adminId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mentorPermission: true,
      },
    });
  }

  async canAccessUserData(requestingUserId: string, targetUserId: string) {
    // Se for o próprio usuário, pode acessar
    if (requestingUserId === targetUserId) {
      return true;
    }

    // Verificar se é admin e se o targetUserId é um mentorado
    const requestingUser = await this.usersRepo.findUnique({
      where: { id: requestingUserId },
      select: { role: true },
    });

    if (requestingUser?.role === 'ADMIN') {
      const targetUser = await this.usersRepo.findUnique({
        where: { id: targetUserId },
        select: { mentorId: true },
      });

      return targetUser?.mentorId === requestingUserId;
    }

    return false;
  }

  async assignMentor(
    adminId: string,
    mentoradoId: string,
    permission?: 'READ_ONLY' | 'FULL_ACCESS',
  ) {
    // Verificar se o usuário é admin
    const admin = await this.usersRepo.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (admin?.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can assign mentors.');
    }

    // Verificar se o mentorado existe
    const mentorado = await this.usersRepo.findUnique({
      where: { id: mentoradoId },
      select: { id: true },
    });

    if (!mentorado) {
      throw new ForbiddenException('Mentorado not found.');
    }

    // Atualizar o mentorId e permission do mentorado
    return this.usersRepo.update({
      where: { id: mentoradoId },
      data: {
        mentorId: adminId,
        mentorPermission: permission || 'READ_ONLY',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mentorPermission: true,
      },
    });
  }

  async removeMentor(adminId: string, mentoradoId: string) {
    // Verificar se o usuário é admin
    const admin = await this.usersRepo.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (admin?.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can remove mentors.');
    }

    // Verificar se o mentorado pertence a este admin
    const mentorado = await this.usersRepo.findUnique({
      where: { id: mentoradoId },
      select: { mentorId: true },
    });

    if (mentorado?.mentorId !== adminId) {
      throw new ForbiddenException('You can only remove your own mentorados.');
    }

    // Remover o mentorId
    return this.usersRepo.update({
      where: { id: mentoradoId },
      data: { mentorId: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async getAllUsersForAssignment(adminId: string) {
    // Verificar se o usuário é admin
    const admin = await this.usersRepo.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (admin?.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access this.');
    }

    // Retornar todos os usuários que não são admins e não são o próprio admin
    return this.usersRepo.findMany({
      where: {
        role: 'USER',
        id: { not: adminId },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        mentorId: true,
      },
    });
  }
}
