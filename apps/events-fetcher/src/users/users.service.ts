import { EventResponseDto } from '@app/dto/events-fetcher/events.dto';
import { EventsServiceUserResponseDto } from '@app/dto/events-fetcher/users.dto';
import { UserRmqRequestDto } from '@app/dto/rabbit-mq-common';
import { IEventsServiceUser } from '@app/types';
import { Injectable } from '@nestjs/common';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

  public async getUserLikedEvents(
    userCId: string,
  ): Promise<EventResponseDto[]> {
    return await this.dal.getEventsByUserAction(userCId, 'liked');
  }

  public async getUserSavedEvents(
    userCId: string,
  ): Promise<EventResponseDto[]> {
    return await this.dal.getEventsByUserAction(userCId, 'saved');
  }

  public async getUserWillGoEvents(
    userCId: string,
  ): Promise<EventResponseDto[]> {
    return await this.dal.getEventsByUserAction(userCId, 'will-go');
  }

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
    await this.dal.requestFriend(userCid, friendCid);
  }

  public async handleRequestFriend(userCid: string, friendCid: string) {
    await this.dal.requestFriend(userCid, friendCid);
  }

  public async handleRejectFriend(userCid: string, friendCid: string) {
    await this.dal.rejectFriend(userCid, friendCid);
  }

  static mapUserDbToResponseUser(
    payload: IEventsServiceUser,
  ): EventsServiceUserResponseDto {
    return {
      birthDate: payload.birthDate,
      cid: payload.cid,
      id: payload.id,
      username: payload.username,
      description: payload.description,
      name: payload.name,
      profilePicture: payload.profilePicture,
    };
  }
}
