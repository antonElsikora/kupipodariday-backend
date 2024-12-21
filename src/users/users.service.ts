import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';

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

  findMany(query: FindOptionsWhere<User>) {
    return this.usersRepo.findBy(query);
  }

  updateOne(id: number, updateData: Partial<User>) {
    return this.usersRepo.update(id, updateData);
  }

  removeOne(id: number) {
    return this.usersRepo.delete(id);
  }
}
