import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(userId, createCategoryDto);
  }

  @Get()
  findAll(@ActiveUserId() userId: string) {
    return this.categoriesService.findAllByUserId(userId);
  }

  @Patch(':categoryId')
  update(
    @ActiveUserId() userId: string,
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(
      userId,
      categoryId,
      updateCategoryDto,
    );
  }

  @Delete(':id')
  remove(@ActiveUserId() userId: string, @Param('id') categoryId: string) {
    return this.categoriesService.remove(userId, categoryId);
  }
}
