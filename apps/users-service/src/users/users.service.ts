import { RMQConstants } from '@app/constants';
import { IGetUserListWithFriendshipStatusAggregationResult } from '@app/database/shared-aggregations';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AssetsUploaders } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(
    private readonly dal: UsersDal,
    private readonly rmqService: RabbitmqService,
  ) {}

  public async createUser(
    payload: AppDto.TransportDto.Users.UserCreatedRmqRequestDto,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserResponseDto> {
    const user = await this.dal.createUser(payload);
    return UsersService.mapUserDbToResponseUser(
      { ...user, friendshipStatus: null },
      [],
    );
  }

  public async updateUser(
    payload: AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserResponseDto | null> {
    const user = await this.dal.updateUser(payload.cid, payload);
    if (!user) {
      return null;
    }
    const friends = await this.dal.getUserFriends(payload.cid);

    return UsersService.mapUserDbToResponseUser(
      { ...user, friendshipStatus: null },
      friends,
    );
  }

  public async deleteUser(cid: string) {
    const userId = await this.dal.deleteUser(cid);
    return userId;
  }

  public async getUserSelf(
    cid: string,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserResponseDto> {
    const user = await this.dal.findUserByCId(cid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const friends = await this.dal.getUserFriends(cid);

    return UsersService.mapUserDbToResponseUser(
      { ...user, friendshipStatus: null },
      friends,
    );
  }

  public async findUsers(
    userCId: string,
    query: string,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto[]> {
    const users = await this.dal.findUsersByQueryUsername(userCId, query);
    return users.map((user) =>
      UsersService.mapUserDbToResponsePartialUser(user),
    );
  }

  public async getUserByCid(
    currentCid: string,
    cid: string,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserResponseDto> {
    const user = await this.dal.findUserByCidWithFirends(currentCid, cid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const friends = await this.dal.getUserFriends(cid);

    return UsersService.mapUserDbToResponseUser(user, friends);
  }

  public async updateUserProfilePicture(cid: string, assetKey: string) {
    const user = await this.dal.findUserByCId(cid);
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    // user.profilePicture = url
    const updatedUser: AppTypes.UsersService.Users.IUser = {
      ...user,
      profilePicture: assetKey,
    };
    // const friends = await this.dal.getUserFriends(cid);

    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      UsersService.mapDbUserToRmqUser(updatedUser),
    );

    // return UsersService.mapUserDbToResponseUser(
    //   { ...updatedUser, friendshipStatus: null },
    //   friends,
    // );
  }

  static mapDbUserToRmqUser(
    user: AppTypes.UsersService.Users.IUser,
  ): AppDto.TransportDto.Users.UserUpdatedRmqRequestDto {
    return {
      birthDate: user.birthDate,
      cid: user.cid,
      email: user.email,
      username: user.username,
      description: user.description,
      phone: user.phone,
      fbId: user.fbId,
      name: user.name,
      profilePicture: user.profilePicture,
      gender: user.gender,
    };
  }

  static mapUserDbToResponseUser(
    user: IGetUserListWithFriendshipStatusAggregationResult<AppTypes.UsersService.Users.IUser>,
    friends: AppTypes.UsersService.Users.IUserWithoutFriends[],
  ): AppDto.UsersServiceDto.UsersDto.UserResponseDto {
    return {
      id: user.id,
      birthDate: user.birthDate,
      friends: friends,
      email: user.email,
      phone: user.phone,
      username: user.username,
      cid: user.cid,
      description: user.description,
      fbId: user.fbId,
      name: user.name,
      profilePicture: user.profilePicture
        ? AssetsUploaders.UserAssetsUploader.getAvatarUrl(
            user.profilePicture,
            AppTypes.AssetsSerivce.Other.SizeName.M,
          )
        : undefined,
      friendshipStatus: user.friendshipStatus,
      gender: user.gender,
    };
  }

  static mapUserDbToResponsePartialUser(
    user: IGetUserListWithFriendshipStatusAggregationResult<AppTypes.UsersService.Users.IUser>,
  ): AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto {
    return {
      id: user.id,
      birthDate: user.birthDate,
      email: user.email,
      phone: user.phone,
      username: user.username,
      cid: user.cid,
      description: user.description,
      fbId: user.fbId,
      name: user.name,
      profilePicture: user.profilePicture
        ? AssetsUploaders.UserAssetsUploader.getAvatarUrl(
            user.profilePicture,
            AppTypes.AssetsSerivce.Other.SizeName.S,
          )
        : undefined,
      friendshipStatus: user.friendshipStatus,
      gender: user.gender,
    };
  }
}
