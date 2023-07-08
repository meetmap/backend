import { RMQConstants } from '@app/constants';
import {
  UserPartialResponseDto,
  UserResponseDto,
} from '@app/dto/main-app/users.dto';
import { UserRmqRequestDto } from '@app/dto/rabbit-mq-common/users.dto';
import { RabbitmqService } from '@app/rabbitmq';
import {
  IMainAppSafePartialUser,
  IMainAppSafeUser,
  IMainAppUser,
  IRmqUser,
  IUser,
} from '@app/types';
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
    payload: UserRmqRequestDto,
  ): Promise<UserResponseDto> {
    const user = await this.dal.createUser(payload);
    return UsersService.mapUserDbToResponseUser(user);
  }

  public async updateUser(
    payload: UserRmqRequestDto,
  ): Promise<UserResponseDto | null> {
    const user = await this.dal.updateUser(payload.cid, payload);
    if (!user) {
      return null;
    }

    return UsersService.mapUserDbToResponseUser(user);
  }

  public async deleteUser(cid: string) {
    const userId = await this.dal.deleteUser(cid);
    return userId;
  }

  public async getUserSelf(cid: string): Promise<UserResponseDto> {
    const user = await this.dal.findUserByCid(cid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UsersService.mapUserDbToResponseUser(user);
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
    // const friendsCids = await this.dal.getFriendsCids(user.id);

    return UsersService.mapUserDbToResponseUser(user);
  }

  public async updateUserProfilePicture(
    cid: string,
    photo: Express.Multer.File,
  ) {
    const user = await this.dal.findUserByCid(cid);
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    // const friendsCids = await this.dal.getFriendsCids(user.id);

    const url = await this.dal.uploadUserProfilePicture(cid, photo);
    // user.profilePicture = url
    const updatedUser: IUser = {
      ...user.toJSON(),
      friendsCIds: [],
      profilePicture: url,
    };

    const result = await this.rmqService.amqp.publish(
      RMQConstants.exchanges.USERS.name,
      RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
      UsersService.mapDbUserToRmqUser(updatedUser),
    );

    return UsersService.mapUserDbToResponseUser(updatedUser);
  }

  static mapDbUserToRmqUser(user: IMainAppUser): IRmqUser {
    return {
      birthDate: user.birthDate,
      cid: user.cid,
      email: user.email,
      id: user.id,
      username: user.username,
      description: user.description,
      phone: user.phone,
      fbId: user.fbId,
      name: user.name,
      profilePicture: user.profilePicture,
    };
  }

  static mapUserDbToResponseUser(
    user: IUser | IMainAppSafeUser,
  ): IMainAppSafeUser {
    return {
      id: user.id,
      birthDate: user.birthDate,
      friendsCIds: user.friendsCIds,
      email: user.email,
      phone: user.phone,
      username: user.username,
      cid: user.cid,
      description: user.description,
      fbId: user.fbId,
      name: user.name,
      profilePicture: user.profilePicture,
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
      description: user.description,
      fbId: user.fbId,
      name: user.name,
      profilePicture: user.profilePicture,
      // authUserId: user.authUserId,
    };
  }
}
