import { IsString, Length, IsOptional, IsUrl } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 1500)
  description?: string;

  @IsOptional()
  @IsUrl()
  image?: string;
}
