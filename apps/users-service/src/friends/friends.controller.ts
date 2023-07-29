import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FriendsService } from './friends.service';

import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import { UsersService } from '../users/users.service';

@ApiTags('Friends')
@Controller('friends')
export class FreindsController {
  constructor(private readonly friendsService: FriendsService) {}

  @ApiOkResponse({
    type: AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto,
    description: 'Request sent successfully',
  })
  @Post('request')
  @UseMicroserviceAuthGuard()
  public async requestFriendship(
    @Body() dto: AppDto.UsersServiceDto.FriendsDto.UpdateFriendshipRequestDto,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto> {
    return await this.friendsService.requestFriendship(
      jwtPayload.cid,
      dto.friendCId,
    );
  }

  @ApiOkResponse({
    type: [AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto],
    description: 'All incoming requests',
  })
  @Get('incoming')
  @UseMicroserviceAuthGuard()
  public async getIncomingFriendshipRequests(
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto[]> {
    const incoming = await this.friendsService.getIncomingFriendshipRequests(
      jwtPayload.cid,
    );

    return incoming.map(UsersService.mapUserDbToResponsePartialUser);
  }

  @ApiOkResponse({
    type: [AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto],
    description: 'All outcoming requests',
  })
  @Get('outcoming')
  @UseMicroserviceAuthGuard()
  public async getOutcomingFriendshipRequests(
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto[]> {
    const requestedUsers =
      await this.friendsService.getOutcomingFriendshipRequests(jwtPayload.cid);

    return requestedUsers.map(UsersService.mapUserDbToResponsePartialUser);
  }

  @ApiOkResponse({
    type: AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto,
    description: 'Accepted successfully',
  })
  @Post('accept')
  @UseMicroserviceAuthGuard()
  public async acceptFriendshipRequest(
    @Body() dto: AppDto.UsersServiceDto.FriendsDto.UpdateFriendshipRequestDto,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto> {
    return await this.friendsService.acceptFriendshipRequest(
      jwtPayload.cid,
      dto.friendCId,
    );
  }

  @ApiOkResponse({
    type: AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto,
    description: 'Reject freindship successfully',
  })
  @Post('reject')
  @UseMicroserviceAuthGuard()
  public async rejectFriendshipRequest(
    @Body() dto: AppDto.UsersServiceDto.FriendsDto.UpdateFriendshipRequestDto,
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto> {
    return await this.friendsService.rejectFriendshipRequest(
      jwtPayload.cid,
      dto.friendCId,
    );
  }

  // @ApiOkResponse({
  //   type: [GetUserLocationResponseDto],
  //   description: 'Get friends location',
  // })
  // @UseMicroserviceAuthGuard()
  // @Get('location')
  // public async getFriendsLocation(
  //   @ExtractJwtPayload() jwtPayload:  AppTypes.JWT.User.IJwtPayload,
  // ): Promise<GetUserLocationResponseDto[]> {
  //   return this.friendsService.getFriendsLocation(user.id);
  // }

  @ApiOkResponse({
    type: [AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto],
    description: 'Array of users',
  })
  @Get('/get/:searchUserCId/?')
  @UseMicroserviceAuthGuard()
  public async getUserFirends(
    @Param('searchUserCId') searchUserCId: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialResponseDto[]> {
    const friends = await this.friendsService.getUserFriends(
      jwt.cid,
      searchUserCId,
      limit,
      page,
    );
    return friends;
  }
}
