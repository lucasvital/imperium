import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CategoriesRepository } from 'src/shared/database/repositories/categories.repositories';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { ValidateCategoryOwnershipService } from './validate-category-ownership.service';

import { isUUID } from 'class-validator';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepo: CategoriesRepository,
    private readonly validateCategoryOwnershipService: ValidateCategoryOwnershipService,
  ) {}

  async create(
    userId: string,
    createCategoryDto: CreateCategoryDto,
  ) {
    const { name, icon, type } = createCategoryDto;

    const categoryAlreadyExists = await this.categoriesRepo.findFirst({
      where: { name, userId: userId },
    });

    if (categoryAlreadyExists) {
      throw new ConflictException('This category already exists.');
    }

    return this.categoriesRepo.create({
      data: {
        userId,
        name,
        icon,
        type,
      },
    });
  }

  findAllByUserId(userId: string) {
    return this.categoriesRepo.findMany({
      where: { userId },
    });
  }

  async getCategoryById(categoryId: string) {
    if (!isUUID(categoryId)) {
      throw new UnauthorizedException('Category must be valid.');
    }

    return this.categoriesRepo.findUnique({
      where: {
        id: categoryId,
      },
    });
  }

  async update(
    userId: string,
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    await this.validateCategoryOwnershipService.validate(userId, categoryId);

    return this.categoriesRepo.update({
      where: { id: categoryId },
      data: updateCategoryDto,
    });
  }

  async remove(userId: string, categoryId: string) {
    await this.validateCategoryOwnershipService.validate(userId, categoryId);

    await this.categoriesRepo.delete({
      where: {
        id: categoryId,
      },
    });

    return null;
  }
}
