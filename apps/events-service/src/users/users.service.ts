import { AppDto } from '@app/dto';
import { AssetsUploaders } from '@app/s3-uploader';
import { AppTypes } from '@app/types';
import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

  public async getUserLikedEvents(
    userCId: string,
    page: number,
  ): Promise<AppDto.EventsServiceDto.EventsDto.EventPaginatedResponseDto> {
    //@todo change location extraction
    const events = await this.dal.getEventsByUserAction(userCId, 'liked', page);
    return {
      paginatedResults: events.paginatedResults.map(
        EventsService.mapDbEventToEventResponse,
      ),
      totalCount: events.totalCount,
      nextPage: events.nextPage ?? undefined,
    };
  }

  public async handleCreateUser(
    payload: AppDto.TransportDto.Users.UserCreatedRmqRequestDto,
  ) {
    await this.dal.createUser(payload);
  }

  public async handleUpdateUser(
    payload: AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
  ) {
    await this.dal.updateUser(payload.cid, payload);
  }

  public async handleDeleteUser(
    payload: AppDto.TransportDto.Users.UserUpdatedRmqRequestDto,
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

  static mapEventsUserToUserResponseDto(
    user: AppTypes.EventsService.Users.IUser,
  ): AppDto.EventsServiceDto.UsersDto.UserResponseDto {
    return {
      birthDate: user.birthDate,
      cid: user.cid,
      gender: user.gender,
      id: user.id,
      name: user.name,
      username: user.username,
      description: user.description,
      profilePicture: user.profilePicture
        ? AssetsUploaders.UserAssetsUploader.getAvatarUrl(
            user.profilePicture,
            AppTypes.AssetsSerivce.Other.SizeName.S,
          )
        : undefined,
      lastTimeOnline: user.lastTimeOnline,
    };
  }
}
