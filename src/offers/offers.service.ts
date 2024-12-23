// offers.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';

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
}
