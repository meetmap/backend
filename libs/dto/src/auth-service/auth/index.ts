import { BaseDto } from '@app/dto/base';
import {
  BooleanField,
  DateField,
  EmailField,
  IdField,
  NestedField,
  PasswordField,
  PhoneField,
  StringField,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class TokensResponseDto extends BaseDto {
  @StringField({
    description: 'Access token',
  })
  at: string;
  @StringField({
    description: 'Refresh token',
  })
  rt: string;
}

export class UserResponseDto
  extends BaseDto
  implements AppTypes.AuthService.Users.ISafeUser
{
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
  })
  name: string;

  @DateField()
  birthDate: Date;

  @IdField()
  cid: string;

  @StringField({ optional: true })
  fbId?: string | undefined;
  @StringField({ enum: AppTypes.Shared.Users.Gender })
  gender: AppTypes.Shared.Users.Gender;

  @DateField({ optional: true })
  lastTimeOnline?: Date | undefined;
}

export class SignInResponseDto extends BaseDto {
  @NestedField(TokensResponseDto, {
    description: 'Tokens',
  })
  tokens: TokensResponseDto;
  @NestedField(UserResponseDto, {
    description: 'User',
  })
  user: UserResponseDto;
}

export class SignUpRequestDto extends BaseDto {
  @PasswordField()
  password: string;

  @EmailField()
  email: string;

  @PhoneField({ optional: true })
  phone?: string;

  @StringField({
    description: 'User name, optional',
  })
  name: string;

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
  @StringField({ enum: AppTypes.Shared.Users.Gender })
  gender: AppTypes.Shared.Users.Gender;
}

export class SignUpWithAuthProviderRequestDto extends BaseDto {
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
  })
  name: string;

  @StringField({
    enum: AppTypes.Shared.Users.Gender,
  })
  gender: AppTypes.Shared.Users.Gender;

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

export class SignInWithAuthProviderRequestDto extends BaseDto {
  @StringField({
    description: 'Short-live auth provider token',
  })
  token: string;
}

export class LinkFacebookRequestDto extends BaseDto {
  @StringField({
    description: 'Short-live auth provider token',
  })
  token: string;
}

export class SignInWithPasswordRequestDto extends BaseDto {
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

export class RefreshAccessTokenRequestDto extends BaseDto {
  @StringField({
    description: 'Refresh token',
  })
  refreshToken: string;
}

export class RefreshAccessTokenResponseDto extends BaseDto {
  @StringField({
    description: 'Access token',
  })
  accessToken: string;
}

export class EntityIsFreeResponseDto extends BaseDto {
  @BooleanField()
  free: boolean;
}

export class UpdateUsernameRequestDto extends BaseDto {
  @StringField({
    description: 'username',
  })
  username: string;
}
