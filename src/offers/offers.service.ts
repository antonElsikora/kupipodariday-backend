import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class OffersService {
  constructor(@InjectRepository(Offer) private offersRepo: Repository<Offer>) {}

  async createOffer(params: {
    amount: number;
    hidden: boolean;
    userId: number;
    itemId: number;
  }) {
    const newOffer = this.offersRepo.create({
      amount: params.amount,
      hidden: params.hidden,
      user: { id: params.userId },
      item: { id: params.itemId },
    });
    return this.offersRepo.save(newOffer);
  }

  async findAll() {
    return this.offersRepo.find({
      relations: {
        user: {
          wishes: true,
          offers: true,
          wishlists: {
            items: true,
            owner: true,
          },
        },
        item: true,
      },
    });
  }

  async findOneOffer(id: number) {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations: {
        user: {
          wishes: true,
          offers: true,
          wishlists: {
            items: true,
            owner: true,
          },
        },
        item: true,
      },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with id=${id} not found`);
    }

    return offer;
  }
}
