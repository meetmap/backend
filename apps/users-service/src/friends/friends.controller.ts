import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FriendsService } from './friends.service';

import { AppDto } from '@app/dto';
import { ParsePagePipe } from '@app/dto/pipes';
import { AppTypes } from '@app/types';

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
    type: AppDto.UsersServiceDto.UsersDto.UserPartialPaginatedResponseDto,
    description: 'All incoming requests',
  })
  @Get('incoming')
  @UseMicroserviceAuthGuard()
  @ApiQuery({
    name: 'page',
    required: false,
  })
  public async getIncomingFriendshipRequests(
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
    @Query('page', new ParsePagePipe()) page: number,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialPaginatedResponseDto> {
    return await this.friendsService.getIncomingFriendshipRequests(
      jwtPayload.cid,
      page,
    );
  }

  @ApiOkResponse({
    type: AppDto.UsersServiceDto.UsersDto.UserPartialPaginatedResponseDto,
    description: 'All outcoming requests',
  })
  @Get('outcoming')
  @UseMicroserviceAuthGuard()
  @ApiQuery({
    name: 'page',
    required: false,
  })
  public async getOutcomingFriendshipRequests(
    @ExtractJwtPayload() jwtPayload: AppTypes.JWT.User.IJwtPayload,
    @Query('page', new ParsePagePipe()) page: number,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialPaginatedResponseDto> {
    return await this.friendsService.getOutcomingFriendshipRequests(
      jwtPayload.cid,
      page,
    );
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

  @ApiOkResponse({
    type: AppDto.UsersServiceDto.UsersDto.UserPartialPaginatedResponseDto,
  })
  @Get('/get/:userCid/?')
  @UseMicroserviceAuthGuard()
  @ApiQuery({
    name: 'page',
    required: false,
  })
  public async getUserFirends(
    @Param('userCid') userCid: string,
    @Query('page', new ParsePagePipe()) page: number,
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.UsersServiceDto.UsersDto.UserPartialPaginatedResponseDto> {
    const friends = await this.friendsService.getUserFriends(
      jwt.cid,
      userCid,
      page,
    );
    return friends;
  }
}
