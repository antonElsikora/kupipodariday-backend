import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class OfferResponseDto {
  @Expose()
  id: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  amount: number;

  @Expose()
  hidden: boolean;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}
