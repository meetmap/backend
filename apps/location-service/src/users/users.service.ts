import { IGetUserListWithFriendshipStatusAggregationResult } from '@app/database/shared-aggregations';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import { Injectable } from '@nestjs/common';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

  public async handleCreateUser(
    payload: AppDto.TransportDto.Users.UserRmqRequestDto,
  ) {
    await this.dal.createUser(payload);
  }

  public async handleUpdateUser(
    payload: AppDto.TransportDto.Users.UserRmqRequestDto,
  ) {
    await this.dal.updateUser(payload.cid, payload);
  }

  public async handleDeleteUser(
    payload: AppDto.TransportDto.Users.UserRmqRequestDto,
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

  static mapUserToUserResponseDto(
    user: IGetUserListWithFriendshipStatusAggregationResult<AppTypes.LocationService.Users.IUser>,
  ): AppDto.LocationServiceDto.Users.UserLocationResponseDto {
    return {
      cid: user.cid,
      id: user.id,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
    };
  }
}
