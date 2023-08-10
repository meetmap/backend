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

  public async handleDeleteUser(
    payload: AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
  ) {
    await this.dal.deleteUser(payload.cid);
  }

  public async handleAddFriend(userCid: string, friendCid: string) {
    await this.dal.acceptFriend(userCid, friendCid);
  }

  public async handleRequestFriend(userCid: string, friendCid: string) {
    await this.dal.requestFriend(userCid, friendCid);
  }

  public async handleRejectFriend(userCid: string, friendCid: string) {
    await this.dal.rejectFriend(userCid, friendCid);
  }
}
