import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wish } from '../wishes/entities/wish.entity';
import { In } from 'typeorm';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist) private wishlistsRepo: Repository<Wishlist>,
    @InjectRepository(Wish) private wishesRepo: Repository<Wish>,
  ) {}

  async createWishlist(userId: number, dto: CreateWishlistDto) {
    const wishlist = this.wishlistsRepo.create({
      name: dto.name,
      description: dto.description,
      image: dto.image,
      owner: { id: userId } as User,
      items: [],
    });

    if (dto.itemsId?.length) {
      const foundWishes = await this.wishesRepo.findBy({
        id: In(dto.itemsId),
      });
      if (foundWishes.length < dto.itemsId.length) {
        throw new NotFoundException('Один из gifts (wish) не найден');
      }

      wishlist.items = foundWishes;
    }

    return this.wishlistsRepo.save(wishlist);
  }

  findOne(query: FindOptionsWhere<Wishlist>) {
    return this.wishlistsRepo.findOne({
      where: query,
      relations: ['owner', 'items'],
    });
  }

  async findByUser(userId: number) {
    return this.wishlistsRepo.find({
      where: { owner: { id: userId } },
      relations: ['items', 'owner'],
    });
  }

  async updateOne(id: number, dto: UpdateWishlistDto) {
    const wishlist = await this.findOne({ id });
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }

    if (dto.name !== undefined) {
      wishlist.name = dto.name;
    }
    if (dto.image !== undefined) {
      wishlist.image = dto.image;
    }
    if (dto.description !== undefined) {
      wishlist.description = dto.description;
    }

    if (dto.itemsId !== undefined) {
      if (dto.itemsId.length) {
        const foundWishes = await this.wishesRepo.findBy({
          id: In(dto.itemsId),
        });
        if (foundWishes.length < dto.itemsId.length) {
          throw new NotFoundException('Некоторые подарки не найдены');
        }
        wishlist.items = foundWishes;
      } else {
        wishlist.items = [];
      }
    }

    return this.wishlistsRepo.save(wishlist);
  }

  async removeOne(id: number) {
    return this.wishlistsRepo.delete(id);
  }

  async addItem(wishlistId: number, wishId: number) {
    const wishlist = await this.findOne({ id: wishlistId });
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    const wish = await this.wishesRepo.findOne({ where: { id: wishId } });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wishlist.items.some((item) => item.id === wishId)) {
      throw new ForbiddenException('Подарок уже добавлен в список желаний');
    }
    wishlist.items.push(wish);
    return this.wishlistsRepo.save(wishlist);
  }

  async removeItem(wishlistId: number, wishId: number) {
    const wishlist = await this.findOne({ id: wishlistId });
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    wishlist.items = wishlist.items.filter((item) => item.id !== wishId);
    return this.wishlistsRepo.save(wishlist);
  }
}
