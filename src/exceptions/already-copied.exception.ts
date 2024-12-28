import { HttpException, HttpStatus } from '@nestjs/common';

export class AlreadyCopiedException extends HttpException {
  constructor() {
    super('Вы уже копировали этот подарок', HttpStatus.BAD_REQUEST);
  }
}