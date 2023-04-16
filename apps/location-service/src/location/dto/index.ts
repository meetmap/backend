import { ICoordinates } from '@app/types';
import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserLocationRequestDto {
  @IsString()
  userId: string;
  @IsNumber()
  lat: number;
  @IsNumber()
  lng: number;
}

export class GetUsersLocationRequestDto {
  @IsString({
    each: true,
  })
  userIds: string[];
}

export class LocationResponseDto implements ICoordinates {
  @ApiProperty({
    type: Number,
    description: 'Latitude',
  })
  lat: number;
  @ApiProperty({
    type: Number,
    description: 'Longitude',
  })
  lng: number;
}

export class GetUserLocationResponseDto {
  @ApiProperty({
    type: LocationResponseDto,
    description: 'Location, can be null',
    nullable: true,
  })
  location: LocationResponseDto | null;
  @ApiProperty({
    type: String,
    description: 'userId',
  })
  userId: string;
}
