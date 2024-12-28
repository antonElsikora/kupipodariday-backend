import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  Post,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { WishesService } from '../wishes/wishes.service';
import { plainToInstance } from 'class-transformer';
import { WishResponseDto } from '../wishes/dto/wish-response.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req) {
    const userId = req.user.userId;
    return this.usersService.getMyProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyProfile(@Request() req, @Body() dto: UpdateUserDto) {
    const userId = req.user.userId;
    return this.usersService.updateMyProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async searchUsers(@Query('search') search: string) {
    if (!search) {
      return [];
    }

    return this.usersService.findManySearch(search);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wishes')
  async getMyWishes(@Request() req) {
    const userId = req.user.userId;

    return this.wishesService.findByOwner(userId);
  }

  @Get(':username')
  async getUserByUsername(
    @Param('username') username: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findByUsername(username);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':username/wishes')
  async getUserWishes(
    @Param('username') username: string,
  ): Promise<WishResponseDto[]> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(
        `Пользователь с именем ${username} не найден`,
      );
    }

    const wishes = await this.wishesService.findByOwner(user.id);

    return plainToInstance(WishResponseDto, wishes, {
      excludeExtraneousValues: true,
    });
  }

  @Post('find')
  async findUsers(@Body() body: { query: string }): Promise<UserResponseDto[]> {
    const { query } = body;
    if (!query) {
      return [];
    }

    const foundUsers = await this.usersService.findManySearch(query);

    return plainToInstance(UserResponseDto, foundUsers, {
      excludeExtraneousValues: true,
    });
  }
}
