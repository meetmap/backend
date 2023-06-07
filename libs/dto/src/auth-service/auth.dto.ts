import { PASSWORD_REGEX } from '@app/constants';
import { ISafeAuthUser } from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import {
  BooleanField,
  DateField,
  EmailField,
  IdField,
  PhoneField,
  StringField,
} from '../decorators';

export class TokensResponseDto {
  @StringField({
    description: 'Access token',
  })
  at: string;
  @StringField({
    description: 'Refresh token',
  })
  rt: string;
}

export class AuthUserResponseDto implements ISafeAuthUser {
  @IdField()
  id: string;
  @EmailField()
  email: string;

  @PhoneField({ optional: true })
  phone?: string;

  @StringField({
    example: 'username',
  })
  username: string;

  @DateField()
  birthDate: Date;

  @IdField()
  cid: string;
}

export class LoginResponseDto {
  @ApiProperty({
    type: TokensResponseDto,
    description: 'Tokens',
  })
  tokens: TokensResponseDto;

  @ApiProperty({
    type: AuthUserResponseDto,
    description: 'User',
  })
  user: AuthUserResponseDto;
}

export class CreateUserRequestDto {
  @StringField({
    description:
      'At least 1 uppercase, 1 lowercase and 1 number, minimal length is 6',
    example: 'Abc12dsaj',
  })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password is not strong enough, it should containt at least 1 uppercase, 1 lowercase and 1 number, minimal length is 6',
  })
  password: string;

  @EmailField()
  email: string;

  @PhoneField({ optional: true })
  phone?: string;

  @StringField({
    description: 'Validation will be added soon',
    example: 'd4v1ds0n_',
  })
  username: string;

  /**
   * @description birthDate should be in ISO 8601 format i.e 2003-04-01T21:00:00.000Z
   */
  @DateField()
  birthDate: Date;
}

export class LoginWithPasswordDto {
  @StringField({
    description: 'Password',
  })
  password: string;

  @EmailField({
    optional: true,
  })
  email?: string;

  @PhoneField({
    optional: true,
  })
  phone?: string;

  @StringField({
    optional: true,
    description: 'Username (optional)',
  })
  username?: string;
}

export class RefreshAccessTokenRequestDto {
  @StringField({
    description: 'Refresh token',
  })
  refreshToken: string;
}

export class RefreshAtResponseDto {
  @StringField({
    description: 'Access token',
  })
  accessToken: string;
}

export class EntityIsFreeResponseDto {
  @BooleanField()
  free: boolean;
}

export class UpdateUsersUsernameRequestDto {
  @StringField({
    description: 'username',
  })
  username: string;
}
