import {
  ExtractUser,
  UseAuthGuard,
  UseMicroserviceAuthGuard,
} from '@app/auth/jwt';
import { IUser } from '@app/types';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  AcceptFriendshipRequestDto,
  RejectFriendshipRequestDto,
  RequestFriendshipDto,
  SuccessResponse,
} from './dto';
import { FriendsService } from './friends.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { GetUserLocationResponseDto } from 'apps/location-service/src/location/dto';
import { UserResponseDto } from '../users/dto';
import { UsersService } from '../users/users.service';

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
    @ExtractUser() user: IUser,
  ): Promise<Omit<UserResponseDto, 'authUserId'>> {
    return await this.friendsService.requestFriendship(user, dto.userId);
  }

  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'All incoming requests',
  })
  @Get('incoming')
  @UseMicroserviceAuthGuard()
  public async getIncomingFriendshipRequests(
    @ExtractUser() user: IUser,
  ): Promise<Omit<UserResponseDto, 'authUserId'>[]> {
    return await this.friendsService.getIncomingFriendshipRequests(user);
  }

  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'All outcoming requests',
  })
  @Get('outcoming')
  @UseMicroserviceAuthGuard()
  public async getOutcomingFriendshipRequests(
    @ExtractUser() user: IUser,
  ): Promise<Omit<UserResponseDto, 'authUserId'>[]> {
    return await this.friendsService.getOutcomingFriendshipRequests(user);
  }

  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Accepted successfully',
  })
  @Post('accept')
  @UseMicroserviceAuthGuard()
  public async acceptFriendshipRequest(
    @Body() dto: AcceptFriendshipRequestDto,
    @ExtractUser() user: IUser,
  ): Promise<Omit<UserResponseDto, 'authUserId'>> {
    return await this.friendsService.acceptFriendshipRequest(
      user,
      dto.friendId,
    );
  }

  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Reject freindship successfully',
  })
  @Post('reject')
  @UseMicroserviceAuthGuard()
  public async rejectFriendshipRequest(
    @Body() dto: RejectFriendshipRequestDto,
    @ExtractUser() user: IUser,
  ): Promise<Omit<UserResponseDto, 'authUserId'>> {
    return await this.friendsService.rejectFriendshipRequest(
      user,
      dto.friendId,
    );
  }

  @ApiOkResponse({
    type: [GetUserLocationResponseDto],
    description: 'Get friends location',
  })
  @UseMicroserviceAuthGuard()
  @Get('location')
  public async getFriendsLocation(
    @ExtractUser() user: IUser,
  ): Promise<GetUserLocationResponseDto[]> {
    return this.friendsService.getFriendsLocation(user.id);
  }

  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'Array of users',
  })
  @Get('/get/:userId/?')
  //   @UseAuthGuard()
  public async getUserFirends(
    @Param('userId') userId: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
    // @ExtractUser() user: IUser,
  ): Promise<Omit<UserResponseDto, 'authUserId'>[]> {
    const friends = await this.friendsService.getUserFriends(
      userId,
      limit,
      page,
    );
    return friends.map((user) => UsersService.mapUserDbToResponseUser(user));
  }
}
