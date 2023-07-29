import { DateField, NumberField } from '@app/dto/decorators';
import { AppTypes } from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import { UserLocationResponseDto } from '../users';

export class UpdateUserLocationRequestDto
  implements AppTypes.LocationService.Users.ICoordinates
{
  @NumberField()
  lat: number;
  @NumberField()
  lng: number;
}

export class LocationResponseDto
  implements AppTypes.LocationService.Users.ICoordinates
{
  @NumberField()
  lat: number;
  @NumberField()
  lng: number;
}

export class GetUserWithLocationResponseDto extends UserLocationResponseDto {
  @ApiProperty({
    type: LocationResponseDto,
    description: 'Location, can be null',
    nullable: true,
  })
  location: LocationResponseDto | null;
  @DateField({ optional: true })
  locationUpdatedAt: Date | null;
}
