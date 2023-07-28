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

export class UserResponseDto implements AppTypes.AuthService.Users.ISafeUser {
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
  @DateField()
  createdAt: Date;
  @DateField()
  updatedAt: Date;
}

export class SignInResponseDto {
  @NestedField(TokensResponseDto, {
    description: 'Tokens',
  })
  tokens: TokensResponseDto;
  @NestedField(UserResponseDto, {
    description: 'User',
  })
  user: UserResponseDto;
}

export class SignUpRequestDto {
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
  })
  name: string;

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

export class SignInWithAuthProviderRequestDto {
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

export class SignInWithPasswordDto {
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

export class EntityIsFreeResponseDto {
  @BooleanField()
  free: boolean;
}

export class UpdateUsernameRequestDto {
  @StringField({
    description: 'username',
  })
  username: string;
}
