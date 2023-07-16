import { ICoordinates } from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import { NumberField } from '../decorators';
import { UserLocationResponseDto } from './users.dto';

export class UpdateUserLocationRequestDto {
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
}
