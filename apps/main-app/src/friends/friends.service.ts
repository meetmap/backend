import { IUser } from '@app/types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { RequestFriendshipDto } from './dto';
import { FreindsDal } from './friends.dal';

@Injectable()
export class FriendsService {
  constructor(private readonly dal: FreindsDal) {}

  public async requestFriendship(user: IUser, payload: RequestFriendshipDto) {
    const recipientUser = await this.dal.getUserByUsername(payload.username);
    if (!this.isValidFriend(user, recipientUser)) {
      throw new BadRequestException('Invalid user');
    }
    await this.dal.sendFriendshipRequest(user.id, recipientUser.id);
    return { success: true };
  }

  public async acceptFriendshipRequest(user: IUser, requesterId: string) {
    const requesterUser = await this.dal.getUserById(requesterId);
    if (!this.isValidFriend(user, requesterUser)) {
      throw new BadRequestException('Invalid user');
    }
    await this.dal.acceptFriendshipRequest(user.id, requesterUser.id);
    return { success: true };
  }
  public async rejectFriendshipRequest(user: IUser, requesterId: string) {
    const requesterUser = await this.dal.getUserById(requesterId);
    if (!this.isValidFriend(user, requesterUser)) {
      throw new BadRequestException('Invalid user');
    }

    await this.dal.rejectFriendshipRequest(user.id, requesterUser.id);
    return { success: true };
  }

  public isValidFriend(user: IUser, friend: IUser | null): friend is IUser {
    if (!friend) {
      throw new NotFoundException(`User not found`);
    }
    if (user.id === friend.id) {
      throw new BadRequestException(
        `Can not procceed friendship request to user itselfs`,
      );
    }
    return true;
  }

  public async getUserFriends(userId: string, limit: number, page: number) {
    if (!(await this.dal.getUserById(userId))) {
      throw new NotFoundException('User not found');
    }
    return this.dal.getUserFriends(userId, limit, page);
  }
}
