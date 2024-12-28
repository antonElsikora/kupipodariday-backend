import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { AlreadyCopiedException } from '../exceptions/already-copied.exception';

@Injectable()
export class WishesService {
  constructor(@InjectRepository(Wish) private wishesRepo: Repository<Wish>) {}

  findOne(where: Partial<Wish>) {
    return this.wishesRepo.findOne({
      where,
      relations: {
        owner: true,
        offers: true,
      },
    });
  }

  async createWish(userId: number, dto: CreateWishDto) {
    const wish = this.wishesRepo.create({
      ...dto,
      owner: { id: userId } as User,
    });
    return this.wishesRepo.save(wish);
  }

  async updateWish(
    userId: number,
    wishId: number,
    dto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.findOne({ id: wishId });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя редактировать чужой подарок');
    }

    if (wish.offers?.length) {
      if (dto.price && dto.price !== wish.price) {
        throw new BadRequestException(
          'Нельзя менять цену, если уже есть офферы',
        );
      }
    }

    if ('raised' in dto) {
      throw new BadRequestException('Поле raised нельзя изменять напрямую');
    }

    await this.updateWishData(wishId, dto);
    return this.findOne({ id: wishId });
  }

  private async updateWishData(
    wishId: number,
    dto: UpdateWishDto,
  ): Promise<void> {
    await this.wishesRepo.update(wishId, dto);
  }

  async removeWish(id: number) {
    return this.wishesRepo.delete(id);
  }

  findLast() {
    return this.wishesRepo.find({
      order: { createdAt: 'desc' },
      take: 40,
      relations: {
        owner: true,
      },
    });
  }

  findTop() {
    return this.wishesRepo.find({
      order: { copied: 'desc' },
      take: 20,
      relations: {
        owner: true,
      },
    });
  }

  async copyWish(userId: number, originalWish: Wish) {
    const existingCopy = await this.wishesRepo.findOne({
      where: { owner: { id: userId }, originalWish: { id: originalWish.id } },
      relations: ['originalWish'],
    });

    if (existingCopy) {
      throw new AlreadyCopiedException();
    }

    await this.wishesRepo.update(originalWish.id, {
      copied: originalWish.copied + 1,
    });

    const newWishData = { ...originalWish };
    delete newWishData.id;
    delete newWishData.createdAt;
    delete newWishData.updatedAt;
    delete newWishData.copied;
    delete newWishData.owner;
    delete newWishData.offers;

    const newWish = this.wishesRepo.create({
      ...newWishData,
      owner: { id: userId },
      raised: 0,
      copied: 0,
      originalWish: originalWish,
    });

    return this.wishesRepo.save(newWish);
  }

  async findByOwner(userId: number) {
    return this.wishesRepo.find({
      where: { owner: { id: userId } },
      relations: [
        'owner',
        'offers',
        'offers.user',
        'offers.user.wishlists',
        'offers.user.wishlists.items',
        'originalWish',
      ],
    });
  }
}
