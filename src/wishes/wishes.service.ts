import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(@InjectRepository(Wish) private wishesRepo: Repository<Wish>) {}

  create(wishData: Partial<Wish>) {
    const wish = this.wishesRepo.create(wishData);
    return this.wishesRepo.save(wish);
  }

  findOne(query: FindOptionsWhere<Wish>) {
    return this.wishesRepo.findOneBy(query);
  }

  findMany(query: FindOptionsWhere<Wish>) {
    return this.wishesRepo.findBy(query);
  }

  updateOne(id: number, updateData: Partial<Wish>) {
    return this.wishesRepo.update(id, updateData);
  }

  removeOne(id: number) {
    return this.wishesRepo.delete(id);
  }
}