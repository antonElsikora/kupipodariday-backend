import { Exclude, Expose, Type } from 'class-transformer';
import { WishlistResponseDto } from '../../wishlists/dto/wishlist-response.dto';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  about: string;

  @Expose()
  avatar: string;

  @Expose()
  email: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => WishlistResponseDto)
  wishlists: WishlistResponseDto[];
}
