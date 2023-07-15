import { ExtractJwtPayload, UseMicroserviceAuthGuard } from '@app/auth/jwt';
import {
  GetUserLocationResponseDto,
  UpdateUserLocationRequestDto,
} from '@app/dto/location-service/location.dto';
import { IJwtUserPayload } from '@app/types/jwt';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { LocationService } from './location.service';
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('/update')
  @UseMicroserviceAuthGuard()
  @ApiOkResponse({
    type: GetUserLocationResponseDto,
    description: 'Update self location',
  })
  public async updateUserLocation(
    @Body() payload: UpdateUserLocationRequestDto,
    @ExtractJwtPayload() jwt: IJwtUserPayload,
  ): Promise<GetUserLocationResponseDto> {
    return this.locationService.updateUserLocation(jwt.cid, payload);
  }

  @ApiOkResponse({
    type: [GetUserLocationResponseDto],
    description: 'Get friends location',
  })
  @UseMicroserviceAuthGuard()
  @Get('/friends')
  public async getFriendsLocation(
    @ExtractJwtPayload() jwt: IJwtUserPayload,
  ): Promise<GetUserLocationResponseDto[]> {
    return await this.locationService.getFriendsLocation(jwt.cid);
  }
}
