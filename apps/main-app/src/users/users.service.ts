import { Injectable } from '@nestjs/common';
import { CreateUserRequestDto } from './dto';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

  public async createUser(payload: CreateUserRequestDto) {
    return this.dal.createUser(payload);
  }
}
