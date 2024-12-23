import { Expose, Type } from 'class-transformer';
import { OfferResponseDto } from '../../offers/dto/offer-response.dto';

export class WishResponseDto {
  @Expose()
  id: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  name: string;

  @Expose()
  link: string;

  @Expose()
  image: string;

  @Expose()
  price: number;

  @Expose()
  raised: number;

  @Expose()
  copied: number;

  @Expose()
  description: string;

  @Expose()
  @Type(() => OfferResponseDto)
  offers: OfferResponseDto[];
}
