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
  ): Promise<AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto> {
    const user = await this.dal.createUser(payload);
    return UsersService.mapUserDbToResponseSingleUser(
      { ...user, friendshipStatus: null },
      {
        paginatedResults: [],
        totalCount: 0,
        nextPage: undefined,
      },
    );
  }

  public async handleUpdateUser(
    payload: AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
  ): Promise<AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto | null> {
    const user = await this.dal.updateUser(payload.cid, payload);
    if (!user) {
      return null;
    }
    const friends = await this.dal.getUserFriends(payload.cid);

    return UsersService.mapUserDbToResponseSingleUser(
      { ...user, friendshipStatus: null },
      {
        paginatedResults: friends.paginatedResults,
        totalCount: friends.totalCount,
        nextPage: friends.nextPage ?? undefined,
      },
    );
  }

  public async updateUser(
    userCid: string,
    payload: AppDto.UsersServiceDto.UsersDto.UpdateUserRequestDto,
  ): Promise<AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto> {
    await this.rmqService.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      AppDto.TransportDto.Users.UserUpdatedRmqRequestDto.create({
        cid: userCid,
        description: payload.description,
        name: payload.name,
      }),
    );

    const userSelf = await this.getUserSelf(userCid);
    return {
      ...userSelf,
      description: payload.description,
    };
  }

  public async deleteUser(cid: string) {
    const userId = await this.dal.deleteUser(cid);
    return userId;
  }

  public async getUserSelf(
    cid: string,
  ): Promise<AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto> {
    const user = await this.dal.findUserByCId(cid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const friends = await this.dal.getUserFriends(cid);

    return UsersService.mapUserDbToResponseSingleUser(
      { ...user, friendshipStatus: null },
      {
        paginatedResults: friends.paginatedResults,
        totalCount: friends.totalCount,
        nextPage: friends.nextPage ?? undefined,
      },
    );
  }

  public async findUsers(
    userCId: string,
    query: string,
    page: number,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialPaginatedResponseDto> {
    const { paginatedResults, nextPage, totalCount } =
      await this.dal.findUsersByQueryUsername(userCId, query, page);
    return {
      paginatedResults: paginatedResults.map((user) =>
        UsersService.mapUserDbToResponsePartialUser(user),
      ),
      totalCount: totalCount,
      nextPage: nextPage ?? undefined,
    };
  }

  public async getUserByCid(
    currentCid: string,
    cid: string,
  ): Promise<AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto> {
    const user = await this.dal.findUserByCidWithFriends(currentCid, cid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const friends = await this.dal.getUserFriends(cid);

    return UsersService.mapUserDbToResponseSingleUser(user, {
      paginatedResults: friends.paginatedResults,
      totalCount: friends.totalCount,
      nextPage: friends.nextPage ?? undefined,
    });
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
    return AppDto.TransportDto.Users.UserUpdatedRmqRequestDto.create({
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
    });
  }

  static mapUserDbToResponseSingleUser(
    user: IGetUserListWithFriendshipStatusAggregationResult<AppTypes.UsersService.Users.IUser>,
    friends: AppTypes.Other.PaginatedResponse.IPaginatedResponse<AppTypes.UsersService.Users.IUserWithoutFriends>,
  ): AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto {
    return AppDto.UsersServiceDto.UsersDto.SingleUserResponseDto.create({
      id: user.id,
      birthDate: user.birthDate,
      friends: {
        paginatedResults: friends.paginatedResults.map((r) =>
          AppDto.UsersServiceDto.UsersDto.UserWithoutFriendsResponseDto.create(
            r,
          ),
        ),
        totalCount: friends.totalCount,
        nextPage: friends.nextPage,
      },
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
      lastTimeOnline: user.lastTimeOnline,
    });
  }

  static mapUserDbToResponsePartialUser(
    user: IGetUserListWithFriendshipStatusAggregationResult<AppTypes.UsersService.Users.IUser>,
  ): AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto {
    return AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto.create({
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
      lastTimeOnline: user.lastTimeOnline,
    });
  }
}
