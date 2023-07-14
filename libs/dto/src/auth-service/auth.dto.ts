import { ISafeAuthUser } from '@app/types';
import {
  BooleanField,
  DateField,
  EmailField,
  IdField,
  NestedField,
  PasswordField,
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

  @StringField({
    example: 'User name',
    optional: true,
  })
  name?: string;

  @DateField()
  birthDate: Date;

  @IdField()
  cid: string;
}

export class LoginResponseDto {
  @NestedField(TokensResponseDto, {
    description: 'Tokens',
  })
  tokens: TokensResponseDto;
  @NestedField(AuthUserResponseDto, {
    description: 'User',
  })
  user: AuthUserResponseDto;
}

export class CreateUserRequestDto {
  @PasswordField()
  password: string;

  @EmailField()
  email: string;

  @PhoneField({ optional: true })
  phone?: string;

  @StringField({
    description: 'User name, optional',
    optional: true,
  })
  name?: string;

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

export class SignUpWithAuthProviderRequestDto {
  @EmailField({
    optional: true,
  })
  email?: string;

  @PhoneField({ optional: true })
  phone?: string;

  @StringField({
    description: 'Validation will be added soon',
    example: 'd4v1ds0n_',
  })
  username: string;

  @StringField({
    description: 'User name, optional',
    optional: true,
  })
  name?: string;

  /**
   * @description birthDate should be in ISO 8601 format i.e 2003-04-01T21:00:00.000Z
   */
  @DateField({
    optional: true,
  })
  birthDate?: Date;
  @StringField({
    description: 'Short-live auth provider token',
  })
  token: string;
}

export class LoginWithAuthProviderRequestDto {
  @StringField({
    description: 'Short-live auth provider token',
  })
  token: string;
}

export class LinkFacebookRequestDto {
  @StringField({
    description: 'Short-live auth provider token',
  })
  token: string;
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
