import { MainAppDatabase } from '@app/database';
import { IUser } from '@app/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersDal {
  constructor(private readonly db: MainAppDatabase) {}
  public async createUser(
    payload: Pick<IUser, 'age' | 'email' | 'nickname' | 'phone'>,
  ) {
    return await this.db.models.users.create({
      age: payload.age,
      email: payload.email,
      nickname: payload.nickname,
      phone: payload.phone,
    });
  }
}
