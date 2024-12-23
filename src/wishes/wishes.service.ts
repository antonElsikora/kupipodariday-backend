import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { User } from '../users/entities/user.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

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

  async updateWish(id: number, dto: UpdateWishDto) {
    await this.wishesRepo.update(id, dto);
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
    await this.wishesRepo.update(originalWish.id, {
      copied: originalWish.copied + 1,
    });

    const { id, createdAt, updatedAt, copied, owner, offers, ...rest } =
      originalWish;
    const newWish = this.wishesRepo.create({
      ...rest,
      owner: { id: userId },
      raised: 0,
      copied: 0,
    });
    return this.wishesRepo.save(newWish);
  }

  async incrementRaised(id: number, amount: number): Promise<void> {
    await this.wishesRepo.increment({ id }, 'raised', amount);
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
      ],
    });
  }
}
