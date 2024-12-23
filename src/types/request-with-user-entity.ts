import { Request } from 'express';
import { User } from '../users/entities/user.entity';

export interface RequestWithUserEntity extends Request {
  user: User;
}
