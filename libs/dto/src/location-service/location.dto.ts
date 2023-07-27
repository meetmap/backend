import { ICoordinates } from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import { DateField, NumberField } from '../decorators';
import { UserLocationResponseDto } from './users.dto';

export class UpdateUserLocationRequestDto implements ICoordinates {
  @NumberField()
  lat: number;
  @NumberField()
  lng: number;
}

export class LocationResponseDto implements ICoordinates {
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
  @DateField()
  locationUpdatedAt: Date | null;
}
