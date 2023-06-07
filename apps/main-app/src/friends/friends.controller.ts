import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { IUser } from '@app/types';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { UsersService } from '../users/users.service';
import {
  RequestFriendshipDto,
  UpdateFriendshipRequestDto,
} from '@app/dto/main-app/friends.dto';
import { UserResponseDto } from '@app/dto/main-app/users.dto';
import { IJwtUserPayload } from '@app/types/jwt';

@ApiTags('Friends')
@Controller('friends')
export class FreindsController {
  constructor(private readonly friendsService: FriendsService) {}

  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Request sent successfully',
  })
  @Post('request')
  @UseMicroserviceAuthGuard()
  public async requestFriendship(
    @Body() dto: RequestFriendshipDto,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<UserResponseDto> {
    return await this.friendsService.requestFriendship(
      jwtPayload.cid,
      dto.userCId,
    );
  }

  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'All incoming requests',
  })
  @Get('incoming')
  @UseMicroserviceAuthGuard()
  public async getIncomingFriendshipRequests(
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<Omit<UserResponseDto, 'authUserId'>[]> {
    return await this.friendsService.getIncomingFriendshipRequests(
      jwtPayload.cid,
    );
  }

  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'All outcoming requests',
  })
  @Get('outcoming')
  @UseMicroserviceAuthGuard()
  public async getOutcomingFriendshipRequests(
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<Omit<UserResponseDto, 'authUserId'>[]> {
    return await this.friendsService.getOutcomingFriendshipRequests(
      jwtPayload.cid,
    );
  }

  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Accepted successfully',
  })
  @Post('accept')
  @UseMicroserviceAuthGuard()
  public async acceptFriendshipRequest(
    @Body() dto: UpdateFriendshipRequestDto,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<Omit<UserResponseDto, 'authUserId'>> {
    return await this.friendsService.acceptFriendshipRequest(
      jwtPayload.cid,
      dto.friendCId,
    );
  }

  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Reject freindship successfully',
  })
  @Post('reject')
  @UseMicroserviceAuthGuard()
  public async rejectFriendshipRequest(
    @Body() dto: UpdateFriendshipRequestDto,
    @ExtractJwtPayload() jwtPayload: IJwtUserPayload,
  ): Promise<Omit<UserResponseDto, 'authUserId'>> {
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
    type: [UserResponseDto],
    description: 'Array of users',
  })
  @Get('/get/:userCId/?')
  //   @UseAuthGuard()
  public async getUserFirends(
    @Param('userCId') userCId: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
    // @ExtractUser() user: IUser,
  ): Promise<Omit<UserResponseDto, 'authUserId'>[]> {
    const friends = await this.friendsService.getUserFriends(
      userCId,
      limit,
      page,
    );
    return friends.map((user) => UsersService.mapUserDbToResponseUser(user));
  }
}
