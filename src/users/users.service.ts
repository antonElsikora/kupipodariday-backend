import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { ILike } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    const existingUser = await this.findOneByEmailOrUsername(
      userData.email,
      userData.username,
    );
    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new ConflictException(
          'Пользователь с таким email уже зарегистрирован',
        );
      } else {
        throw new ConflictException(
          'Пользователь с таким username уже зарегистрирован',
        );
      }
    }

    const user = this.usersRepo.create(userData);
    return this.usersRepo.save(user);
  }

  findOne(query: FindOptionsWhere<User>) {
    return this.usersRepo.findOneBy(query);
  }

  async findOneByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | undefined> {
    return this.usersRepo.findOne({
      where: [{ email }, { username }],
    });
  }

  async updateOne(id: number, updateData: Partial<User>) {
    if (updateData.email || updateData.username) {
      const foundUser = await this.usersRepo.findOne({
        where: [{ email: updateData.email }, { username: updateData.username }],
      });

      if (foundUser && foundUser.id !== id) {
        if (foundUser.email === updateData.email) {
          throw new ConflictException(
            'Пользователь с таким email уже зарегистрирован',
          );
        } else {
          throw new ConflictException(
            'Пользователь с таким username уже зарегистрирован',
          );
        }
      }
    }

    await this.usersRepo.update(id, updateData);
    return this.findOne({ id });
  }

  async findManySearch(search: string) {
    return this.usersRepo.find({
      where: [
        { username: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
      ],
    });
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { username },
    });
    if (!user) {
      throw new NotFoundException(
        `Пользователь с именем ${username} не найден`,
      );
    }
    return user;
  }
}
