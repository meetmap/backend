import { AppDto } from '@app/dto';
import { Injectable } from '@nestjs/common';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}
  public async handleCreateUser(
    payload: AppDto.TransportDto.Users.UserCreatedRmqRequestDto,
  ) {
    await this.dal.createUser(payload);
  }

  public async handleUpdateUser(
    payload: AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
  ) {
    await this.dal.updateUser(payload.cid, payload);
  }

  public async handleDeleteUser(cid: string) {
    await this.dal.deleteUser(cid);
  }
}
