import { ExtractUser, UseAuthGuard } from '@app/auth/jwt';
import { IUser } from '@app/types';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  AcceptFriendshipRequestDto,
  RejectFriendshipRequestDto,
  RequestFriendshipDto,
} from './dto';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FreindsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request')
  @UseAuthGuard()
  public async requestFriendship(
    @Body() dto: RequestFriendshipDto,
    @ExtractUser() user: IUser,
  ) {
    return await this.friendsService.requestFriendship(user, dto);
  }

  @Post('accept')
  @UseAuthGuard()
  public async acceptFriendshipRequest(
    @Body() dto: AcceptFriendshipRequestDto,
    @ExtractUser() user: IUser,
  ) {
    return await this.friendsService.acceptFriendshipRequest(
      user,
      dto.friendId,
    );
  }

  @Post('reject')
  @UseAuthGuard()
  public async rejectFriendshipRequest(
    @Body() dto: RejectFriendshipRequestDto,
    @ExtractUser() user: IUser,
  ) {
    return await this.friendsService.rejectFriendshipRequest(
      user,
      dto.friendId,
    );
  }

  @UseAuthGuard()
  @Get('location')
  public async getFriendsLocation(@ExtractUser() user: IUser) {
    return this.friendsService.getFriendsLocation(user.id);
  }

  @Get('/get/:userId/?')
  //   @UseAuthGuard()
  public async getUserFirends(
    @Param('userId') userId: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
    // @ExtractUser() user: IUser,
  ) {
    return await this.friendsService.getUserFriends(userId, limit, page);
  }
}
