import { IGetUserListWithFriendshipStatusAggregationResult } from '@app/database/shared-aggregations';
import { UserLocationResponseDto } from '@app/dto/location-service/users.dto';
import { UserRmqRequestDto } from '@app/dto/rabbit-mq-common/users.dto';
import { ILocationServiceUser } from '@app/types';
import { Injectable } from '@nestjs/common';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

  public async handleCreateUser(payload: UserRmqRequestDto) {
    await this.dal.createUser(payload);
  }

  public async handleUpdateUser(payload: UserRmqRequestDto) {
    await this.dal.updateUser(payload.cid, payload);
  }

  public async handleDeleteUser(payload: UserRmqRequestDto) {
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

  static mapUserToUserResponseDto(
    user: IGetUserListWithFriendshipStatusAggregationResult<ILocationServiceUser>,
  ): UserLocationResponseDto {
    return {
      cid: user.cid,
      id: user.id,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
    };
  }
}
