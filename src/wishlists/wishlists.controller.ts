import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@UseGuards(JwtAuthGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  async createWishlist(@Request() req, @Body() dto: CreateWishlistDto) {
    const userId = req.user.userId;
    return this.wishlistsService.createWishlist(userId, dto);
  }

  @Get()
  async getUserWishlists(@Request() req) {
    const userId = req.user.userId;
    return this.wishlistsService.findByUser(userId);
  }

  @Get(':id')
  async getWishlistById(@Param('id') id: number, @Request() req) {
    const wishlist = await this.wishlistsService.findOne({ id });
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    if (wishlist.owner.id !== req.user.userId) {
      throw new ForbiddenException('Нет доступа к этому списку желаний');
    }
    return wishlist;
  }

  @Patch(':id')
  async updateWishlist(
    @Param('id') id: number,
    @Body() dto: UpdateWishlistDto,
    @Request() req,
  ) {
    const wishlist = await this.wishlistsService.findOne({ id });
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    if (wishlist.owner.id !== req.user.userId) {
      throw new ForbiddenException('Нельзя редактировать чужой список желаний');
    }
    await this.wishlistsService.updateOne(id, dto);
    return this.wishlistsService.findOne({ id });
  }

  @Delete(':id')
  async removeWishlist(@Param('id') id: number, @Request() req) {
    const wishlist = await this.wishlistsService.findOne({ id });
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    if (wishlist.owner.id !== req.user.userId) {
      throw new ForbiddenException('Нельзя удалять чужой список желаний');
    }
    return this.wishlistsService.removeOne(id);
  }

  @Post(':id/items')
  async addItemToWishlist(
    @Param('id') id: number,
    @Body('wishId') wishId: number,
    @Request() req,
  ) {
    const wishlist = await this.wishlistsService.findOne({ id });
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    if (wishlist.owner.id !== req.user.userId) {
      throw new ForbiddenException('Нельзя добавлять в чужой список желаний');
    }
    return this.wishlistsService.addItem(id, wishId);
  }

  @Delete(':id/items/:wishId')
  async removeItemFromWishlist(
    @Param('id') id: number,
    @Param('wishId') wishId: number,
    @Request() req,
  ) {
    const wishlist = await this.wishlistsService.findOne({ id });
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    if (wishlist.owner.id !== req.user.userId) {
      throw new ForbiddenException('Нельзя удалять из чужого списка желаний');
    }
    return this.wishlistsService.removeItem(id, wishId);
  }
}
