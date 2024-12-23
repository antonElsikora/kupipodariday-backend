import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { ILike } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  create(userData: Partial<User>) {
    const user = this.usersRepo.create(userData);
    return this.usersRepo.save(user);
  }

  findOne(query: FindOptionsWhere<User>) {
    return this.usersRepo.findOneBy(query);
  }

  updateOne(id: number, updateData: Partial<User>) {
    return this.usersRepo.update(id, updateData);
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
