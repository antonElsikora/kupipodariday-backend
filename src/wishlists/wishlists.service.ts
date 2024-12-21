import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(@InjectRepository(Wishlist) private wishlistsRepo: Repository<Wishlist>) {}

  create(wishlistData: Partial<Wishlist>) {
    const wishlist = this.wishlistsRepo.create(wishlistData);
    return this.wishlistsRepo.save(wishlist);
  }

  findOne(query: FindOptionsWhere<Wishlist>) {
    return this.wishlistsRepo.findOneBy(query);
  }

  findMany(query: FindOptionsWhere<Wishlist>) {
    return this.wishlistsRepo.findBy(query);
  }

  updateOne(id: number, updateData: Partial<Wishlist>) {
    return this.wishlistsRepo.update(id, updateData);
  }

  removeOne(id: number) {
    return this.wishlistsRepo.delete(id);
  }
}