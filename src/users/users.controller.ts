import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req) {
    const userId = req.user.userId;
    const user = await this.usersService.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyProfile(@Request() req, @Body() dto: UpdateUserDto) {
    const userId = req.user.userId;
    const user = await this.usersService.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (dto.password) {
      const saltRounds = 10;
      dto.password = await bcrypt.hash(dto.password, saltRounds);
    }

    await this.usersService.updateOne(userId, dto);

    return this.usersService.findOne({ id: userId });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: number) {
    const user = await this.usersService.findOne({ id });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async searchUsers(@Query('search') search: string) {
    if (!search) {
      return [];
    }

    return this.usersService.findManySearch(search);
  }
}
