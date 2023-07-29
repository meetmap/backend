import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import { Injectable } from '@nestjs/common';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

  public async getUserLikedEvents(
    userCId: string,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventResponseDto[]> {
    return await this.dal.getEventsByUserAction(userCId, 'liked');
  }

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
    await this.dal.requestFriend(userCid, friendCid);
  }

  public async handleRequestFriend(userCid: string, friendCid: string) {
    await this.dal.requestFriend(userCid, friendCid);
  }

  public async handleRejectFriend(userCid: string, friendCid: string) {
    await this.dal.rejectFriend(userCid, friendCid);
  }

  static mapUserDbToResponseUser(
    payload: AppTypes.EventsService.Users.IUser,
  ): AppDto.EventsServiceDto.UsersDto.EventsServiceUserResponseDto {
    return {
      birthDate: payload.birthDate,
      cid: payload.cid,
      id: payload.id,
      username: payload.username,
      description: payload.description,
      name: payload.name,
      profilePicture: payload.profilePicture,
      gender: payload.gender,
    };
  }
}
