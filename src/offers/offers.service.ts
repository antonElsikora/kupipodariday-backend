import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { NotFoundException } from '@nestjs/common';
import { WishesService } from '../wishes/wishes.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    private dataSource: DataSource,
    private wishesService: WishesService,
  ) {}

  async createOffer(userId: number, dto: CreateOfferDto): Promise<Offer> {
    const { amount, hidden, itemId } = dto;

    const wish = await this.wishesService.findOne({ id: itemId });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    if (wish.owner.id === userId) {
      throw new ForbiddenException(
        'Нельзя скидываться на свой собственный подарок',
      );
    }

    const alreadyRaised = Number(wish.raised);
    if (alreadyRaised >= wish.price) {
      throw new BadRequestException('На подарок уже собрана вся сумма');
    }

    const remainder = wish.price - alreadyRaised;
    if (amount > remainder) {
      throw new BadRequestException(
        `Сумма не может превышать остаток ${remainder}`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const newOffer = this.offersRepo.create({
        amount,
        hidden: hidden ?? false,
        user: { id: userId },
        item: { id: itemId },
      });

      const savedOffer = await manager.save(newOffer);

      await manager.increment(Wish, { id: itemId }, 'raised', amount);

      return savedOffer;
    });
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
