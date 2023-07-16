import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FriendsService } from './friends.service';

import { UpdateFriendshipRequestDto } from '@app/dto/main-app/friends.dto';
import { UserPartialResponseDto } from '@app/dto/main-app/users.dto';
import { IJwtUserPayload } from '@app/types/jwt';
import { UsersService } from '../users/users.service';

@ApiTags('Friends')
@Controller('friends')
export class FreindsController {
  constructor(private readonly friendsService: FriendsService) {}

  @ApiOkResponse({
    type: UserPartialResponseDto,
    description: 'Request sent successfully',
  })
  @Post('request')
  @UseMicroserviceAuthGuard()
  public async requestFriendship(
    @Body() dto: UpdateFriendshipRequestDto,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<UserPartialResponseDto> {
    return await this.friendsService.requestFriendship(
      jwtPayload.cid,
      dto.friendCId,
    );
  }

  @ApiOkResponse({
    type: [UserPartialResponseDto],
    description: 'All incoming requests',
  })
  @Get('incoming')
  @UseMicroserviceAuthGuard()
  public async getIncomingFriendshipRequests(
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<UserPartialResponseDto[]> {
    const incoming = await this.friendsService.getIncomingFriendshipRequests(
      jwtPayload.cid,
    );

    return incoming.map(UsersService.mapUserDbToResponsePartialUser);
  }

  @ApiOkResponse({
    type: [UserPartialResponseDto],
    description: 'All outcoming requests',
  })
  @Get('outcoming')
  @UseMicroserviceAuthGuard()
  public async getOutcomingFriendshipRequests(
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<UserPartialResponseDto[]> {
    const requestedUsers =
      await this.friendsService.getOutcomingFriendshipRequests(jwtPayload.cid);

    return requestedUsers.map(UsersService.mapUserDbToResponsePartialUser);
  }

  @ApiOkResponse({
    type: UserPartialResponseDto,
    description: 'Accepted successfully',
  })
  @Post('accept')
  @UseMicroserviceAuthGuard()
  public async acceptFriendshipRequest(
    @Body() dto: UpdateFriendshipRequestDto,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<UserPartialResponseDto> {
    return await this.friendsService.acceptFriendshipRequest(
      jwtPayload.cid,
      dto.friendCId,
    );
  }

  @ApiOkResponse({
    type: UserPartialResponseDto,
    description: 'Reject freindship successfully',
  })
  @Post('reject')
  @UseMicroserviceAuthGuard()
  public async rejectFriendshipRequest(
    @Body() dto: UpdateFriendshipRequestDto,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<UserPartialResponseDto> {
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
  //   @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  // ): Promise<GetUserLocationResponseDto[]> {
  //   return this.friendsService.getFriendsLocation(user.id);
  // }

  @ApiOkResponse({
    type: [UserPartialResponseDto],
    description: 'Array of users',
  })
  @Get('/get/:searchUserCId/?')
  @UseMicroserviceAuthGuard()
  public async getUserFirends(
    @Param('searchUserCId') searchUserCId: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @ExtractJwtPayload() jwt: IJwtUserPayload,
  ): Promise<UserPartialResponseDto[]> {
    const friends = await this.friendsService.getUserFriends(
      jwt.cid,
      searchUserCId,
      limit,
      page,
    );
    return friends;
  }
}
