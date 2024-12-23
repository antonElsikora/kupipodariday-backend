import { Request } from 'express';

export interface RequestWithUserPayload extends Request {
  user: {
    userId: number;
    username: string;
  };
}
