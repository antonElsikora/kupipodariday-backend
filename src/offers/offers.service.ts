import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(@InjectRepository(Offer) private offersRepo: Repository<Offer>) {}

  create(offerData: Partial<Offer>) {
    const offer = this.offersRepo.create(offerData);
    return this.offersRepo.save(offer);
  }

  findOne(query: FindOptionsWhere<Offer>) {
    return this.offersRepo.findOneBy(query);
  }

  findMany(query: FindOptionsWhere<Offer>) {
    return this.offersRepo.findBy(query);
  }

  updateOne(id: number, updateData: Partial<Offer>) {
    return this.offersRepo.update(id, updateData);
  }

  removeOne(id: number) {
    return this.offersRepo.delete(id);
  }
}
