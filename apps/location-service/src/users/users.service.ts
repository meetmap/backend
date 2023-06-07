import { UserRmqRequestDto } from '@app/dto/main-app/users.dto';
import { Injectable } from '@nestjs/common';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

  public async handleCreateUser(payload: UserRmqRequestDto) {
    await this.dal.createUser(payload);
  }

  public async handleDeleteUser(payload: UserRmqRequestDto) {
    await this.dal.deleteUser(payload.cid);
  }

  public async handleAddFriend(userCid: string, friendCid: string) {
    await this.dal.addFriendCid(userCid, friendCid);
  }

  public async handleRemoveFriend(userCid: string, friendCid: string) {
    await this.dal.removeFriendCid(userCid, friendCid);
  }
}
