import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(userData: {
    username: string;
    email: string;
    password: string;
    about?: string;
    avatar?: string;
  }) {
    const existingUser = await this.usersService.findOneByEmailOrUsername(
      userData.email,
      userData.username,
    );
    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      } else {
        throw new ConflictException(
          'Пользователь с таким username уже существует',
        );
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    return this.usersService.create({
      ...userData,
      password: passwordHash,
    });
  }

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findOne({ username });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
