import { ICoordinates } from '@app/types';
import { IsNumber, IsString } from 'class-validator';

export class UpdateUserLocationDto {
  @IsString()
  userId: string;
  @IsNumber()
  lat: number;
  @IsNumber()
  lng: number;
}

export class GetUsersLocationDto {
  @IsString({
    each: true,
  })
  userIds: string[];
}
