import { Expose, Type } from 'class-transformer';
import { WishlistItemDto } from './wishlist-item.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class WishlistResponseDto {
  @Expose()
  id: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  name: string;

  @Expose()
  image: string;

  @Expose()
  @Type(() => UserResponseDto)
  owner: UserResponseDto;

  @Expose()
  @Type(() => WishlistItemDto)
  items: WishlistItemDto[];
}
