import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  Body,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@UseGuards(JwtAuthGuard)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  async createWish(@Request() req, @Body() createWishDto: CreateWishDto) {
    const userId = req.user.userId;
    return this.wishesService.createWish(userId, createWishDto);
  }

  @Patch(':id')
  async updateWish(
    @Request() req,
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    const wish = await this.wishesService.findOne({ id });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id !== req.user.userId) {
      throw new ForbiddenException('Нельзя редактировать чужой подарок');
    }

    if (wish.offers?.length) {
      if (updateWishDto.price && updateWishDto.price !== wish.price) {
        throw new BadRequestException(
          'Нельзя менять цену, если уже есть офферы',
        );
      }
    }

    if ('raised' in updateWishDto) {
      throw new BadRequestException('Поле raised нельзя изменять напрямую');
    }

    await this.wishesService.updateWish(id, updateWishDto);
    return this.wishesService.findOne({ id });
  }

  @Delete(':id')
  async removeWish(@Request() req, @Param('id') id: number) {
    const wish = await this.wishesService.findOne({ id });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wish.owner.id !== req.user.userId) {
      throw new ForbiddenException('Нельзя удалять чужой подарок');
    }
    if (wish.offers?.length) {
      throw new BadRequestException(
        'Нельзя удалить подарок, на который уже скидываются',
      );
    }

    return this.wishesService.removeWish(id);
  }

  @Get('last')
  async getLastWishes() {
    return this.wishesService.findLast();
  }

  @Get('top')
  async getTopWishes() {
    return this.wishesService.findTop();
  }

  @Get(':id')
  async getWish(@Param('id') id: number) {
    const wish = await this.wishesService.findOne({ id });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    return wish;
  }

  @Post(':id/copy')
  async copyWish(@Request() req, @Param('id') id: number) {
    const wish = await this.wishesService.findOne({ id });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    return this.wishesService.copyWish(req.user.userId, wish);
  }
}
