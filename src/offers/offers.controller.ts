import {
  Controller,
  Post,
  UseGuards,
  Body,
  Request,
  Get,
  Param,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OffersService } from './offers.service';
import { WishesService } from '../wishes/wishes.service';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly wishesService: WishesService,
  ) {}

  @Post()
  async createOffer(@Request() req, @Body() dto: CreateOfferDto) {
    const userId = req.user.userId;

    const { amount, hidden, itemId } = dto as any;

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

    const offer = await this.offersService.createOffer({
      amount,
      hidden: hidden ?? false,
      userId,
      itemId,
    });

    await this.wishesService.incrementRaised(wish.id, amount);

    return offer;
  }

  @Get()
  async getAllOffers() {
    return this.offersService.findAll();
  }

  @Get(':id')
  async getOfferById(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.findOneOffer(id);
  }
}
