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

  public async getUserWillGoEvents(userCId: string) {
    return await this.dal.getEventsByUserAction(userCId, 'will-go');
  }

  public async createUser(
    payload: UserRmqRequestDto,
  ): Promise<EventsServiceUserResponseDto> {
    const user = await this.dal.createUser(payload);
    return UsersService.mapUserDbToResponseUser(user);
  }

  public async updateUser(
    payload: UserRmqRequestDto,
  ): Promise<EventsServiceUserResponseDto | null> {
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
