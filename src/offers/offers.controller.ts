import {
  Controller,
  Post,
  UseGuards,
  Body,
  Request,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OffersService } from './offers.service';
import { WishesService } from '../wishes/wishes.service';
import { RequestWithUserPayload } from 'src/types/request-with-user-payload';

@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly wishesService: WishesService,
  ) {}

  @Post()
  async createOffer(
    @Request() req: RequestWithUserPayload,
    @Body() dto: CreateOfferDto,
  ) {
    const userId = req.user.userId;
    return this.offersService.createOffer(userId, dto);
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
