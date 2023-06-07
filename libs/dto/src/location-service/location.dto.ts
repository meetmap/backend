import { ICoordinates } from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import { IdField, NumberField, StringField } from '../decorators';

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

export class GetUserLocationResponseDto {
  @ApiProperty({
    type: LocationResponseDto,
    description: 'Location, can be null',
    nullable: true,
  })
  location: LocationResponseDto | null;
  @IdField()
  cid: string;
}
