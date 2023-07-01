import {
  UserPartialResponseDto,
  UserResponseDto,
  UserRmqRequestDto,
} from '@app/dto/main-app/users.dto';
import { RabbitmqService } from '@app/rabbitmq';
import { IMainAppSafePartialUser, IMainAppSafeUser, IUser } from '@app/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(
    private readonly dal: UsersDal,
    private readonly rmq: RabbitmqService,
  ) {}

  public async createUser(
    payload: UserRmqRequestDto,
  ): Promise<UserResponseDto> {
    const user = await this.dal.createUser(payload);
    const friendsCids = await this.dal.getFriendsCids(user.id);
    return UsersService.mapUserDbToResponseUser(user, friendsCids);
  }

  public async updateUser(
    payload: UserRmqRequestDto,
  ): Promise<UserResponseDto | null> {
    const user = await this.dal.updateUser(payload.cid, payload);
    if (!user) {
      return null;
    }
    const friendsCids = await this.dal.getFriendsCids(user.id);
    return UsersService.mapUserDbToResponseUser(user, friendsCids);
  }

  public async deleteUser(cid: string) {
    const userId = await this.dal.deleteUser(cid);
    return userId;
  }

  public async getUserSelf(cid: string): Promise<UserResponseDto> {
    const user = await this.dal.findUserByCorrelationId(cid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const friendsCids = await this.dal.getFriendsCids(user.id);

    return UsersService.mapUserDbToResponseUser(user, friendsCids);
  }

  public async findUsers(query: string): Promise<UserPartialResponseDto[]> {
    const users = await this.dal.findUsersByQueryUsername(query);
    return users.map((user) =>
      UsersService.mapUserDbToResponsePartialUser(user),
    );
  }

  public async getUserByCid(cid: string): Promise<IMainAppSafeUser> {
    const user = await this.dal.findUserByCid(cid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const friendsCids = await this.dal.getFriendsCids(user.id);

    return UsersService.mapUserDbToResponseUser(user, friendsCids);
  }

  static mapUserDbToResponseUser(
    user: IUser | IMainAppSafeUser,
    friendsCids: string[],
  ): IMainAppSafeUser {
    return {
      id: user.id,
      birthDate: user.birthDate,
      friendsCids: friendsCids,
      email: user.email,
      phone: user.phone,
      username: user.username,
      cid: user.cid,
      // authUserId: user.authUserId,
    };
  }

  static mapUserDbToResponsePartialUser(
    user: IUser | IMainAppSafeUser | IMainAppSafePartialUser,
  ): UserPartialResponseDto {
    return {
      id: user.id,
      birthDate: user.birthDate,
      email: user.email,
      phone: user.phone,
      username: user.username,
      cid: user.cid,
      // authUserId: user.authUserId,
    };
  }
}
