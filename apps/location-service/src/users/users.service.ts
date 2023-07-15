import { UserRmqRequestDto } from '@app/dto/rabbit-mq-common/users.dto';
import { Injectable } from '@nestjs/common';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

  public async handleCreateUser(payload: UserRmqRequestDto) {
    await this.dal.createUser(payload);
  }
  //@todo change schema back if u don't really need it (fetch users from main service, here fetch only location and permissions for tracking)
  public async handleUpdateUser(payload: UserRmqRequestDto) {
    await this.dal.updateUser(payload.cid, payload);
  }

  public async handleDeleteUser(payload: UserRmqRequestDto) {
    await this.dal.deleteUser(payload.cid);
  }

  public async handleAddFriend(userCid: string, friendCid: string) {
    await this.dal.requestFriend(userCid, friendCid);
  }

  public async handleRequestFriend(userCid: string, friendCid: string) {
    await this.dal.requestFriend(userCid, friendCid);
  }

  public async handleRejectFriend(userCid: string, friendCid: string) {
    await this.dal.rejectFriend(userCid, friendCid);
  }
}
