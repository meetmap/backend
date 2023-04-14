import { PASSWORD_REGEX } from '@app/constants';
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Matches,
  Max,
  MaxDate,
  Min,
  MinDate,
} from 'class-validator';

export class CreateUserRequestDto {
  @Matches(PASSWORD_REGEX, {
    message:
      'Password is not strong enough, it should containt at least 1 uppercase, 1 lowercase and 1 number, minimal length is 6',
  })
  password: string;
  @IsEmail()
  email: string;
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
  @IsString()
  username: string;
  /**
   * @description birthDate should be in ISO 8601 format i.e 2003-04-01T21:00:00.000Z
   */
  @IsDateString()
  birthDate: Date;
}

export class LoginWithPasswordDto {
  @IsString()
  password: string;
  @IsEmail()
  @IsOptional()
  email?: string;
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
  @IsString()
  @IsOptional()
  username?: string;
}

export class UpdateUsersUsernameDto {
  @IsString()
  username: string;
}

export class RefreshAccessTokenDto {
  @IsString()
  refreshToken: string;
}

export class UpdateUserLocationDto {
  @IsNumber()
  lat: number;
  @IsNumber()
  lng: number;
}
