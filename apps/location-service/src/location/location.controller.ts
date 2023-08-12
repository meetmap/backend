import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import { AppDto } from '@app/dto';
import { AppTypes } from '@app/types';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { LocationService } from './location.service';
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('/update')
  @UseMicroserviceAuthGuard({
    disableLastTimeOnline: true,
  })
  @ApiOkResponse({
    type: AppDto.LocationServiceDto.LocationDto.GetUserWithLocationResponseDto,
    description: 'Update self location',
  })
  public async updateUserLocation(
    @Body()
    payload: AppDto.LocationServiceDto.LocationDto.UpdateUserLocationRequestDto,
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  ): Promise<AppDto.LocationServiceDto.LocationDto.GetUserWithLocationResponseDto> {
    return this.locationService.updateUserLocation(jwt.cid, payload);
  }

  @ApiOkResponse({
    type: [
      AppDto.LocationServiceDto.LocationDto.GetUserWithLocationResponseDto,
    ],
    description: 'Get friends location',
  })
  @UseMicroserviceAuthGuard()
  @Get('/friends')
  public async getFriendsLocation(
    @ExtractJwtPayload() jwt: AppTypes.JWT.User.IJwtPayload,
  ): Promise<
    AppDto.LocationServiceDto.LocationDto.GetUserWithLocationResponseDto[]
  > {
    return await this.locationService.getFriendsLocation(jwt.cid);
  }
}
