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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IFriends, IUser } from '@app/types';
import { PopulatedDoc, Types } from 'mongoose';

export class CreateUserRequestDto {
  @ApiProperty({
    type: String,
    description:
      'At least 1 uppercase, 1 lowercase and 1 number, minimal length is 6',
    example: 'Abc12dsaj',
  })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password is not strong enough, it should containt at least 1 uppercase, 1 lowercase and 1 number, minimal length is 6',
  })
  password: string;

  @ApiProperty({
    type: String,
    description: 'Email',
    title: 'Email',
    example: 'd4v1ds0n.p@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Phone number',
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Validation will be added soon',
    example: 'd4v1ds0n_',
  })
  username: string;

  /**
   * @description birthDate should be in ISO 8601 format i.e 2003-04-01T21:00:00.000Z
   */
  @ApiProperty({
    type: String,
    description: 'birthDate should be in ISO 8601 format',
    example: '2003-04-01T21:00:00.000Z',
  })
  @IsDateString()
  birthDate: Date;
}

export class LoginWithPasswordDto {
  @ApiProperty({
    type: String,
    description: 'Password',
  })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Email (optional)',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Phone (optional)',
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Username (optional)',
  })
  @IsString()
  @IsOptional()
  username?: string;
}

export class UpdateUsersUsernameDto {
  @ApiProperty({
    type: String,
    description: 'username',
  })
  @IsString()
  username: string;
}

export class RefreshAccessTokenDto {
  @ApiProperty({
    type: String,
    description: 'Refresh token',
  })
  @IsString()
  refreshToken: string;
}

export class UpdateUserLocationDto {
  @ApiProperty({
    type: Number,
    description: 'latitude',
  })
  @IsNumber()
  lat: number;
  @ApiProperty({
    type: Number,
    description: 'longitude',
  })
  @IsNumber()
  lng: number;
}

export class UserResponseDto
  implements
    Pick<
      IUser,
      'birthDate' | 'friendsIds' | 'email' | 'phone' | 'username' | 'id'
    >
{
  @ApiProperty({
    type: String,
    description: 'user id',
    example: '6436b4fa091dc0948e7566c5',
  })
  id: string;
  @ApiProperty({
    type: String,
    example: 'd4v1ds0n.p@gmail.com',
  })
  email: string;

  @ApiPropertyOptional({
    type: String,
    example: '0534759131',
  })
  phone?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'username',
  })
  username: string;

  @ApiProperty({
    type: String,
    description: 'birthDate should be in ISO 8601 format',
    example: '2003-04-01T21:00:00.000Z',
  })
  birthDate: Date;

  @ApiProperty({
    type: [String],
    description: 'ids of friends or friends(users) array',
    example: ['6436b4ff091dc0948e75671f', '6436b4fa091dc0948e7566c5'],
  })
  friendsIds: PopulatedDoc<IFriends, Types.ObjectId | undefined>[];
}

export class TokensResponseDto {
  @ApiProperty({
    type: String,
    description: 'Access token',
  })
  at: string;
  @ApiProperty({
    type: String,
    description: 'Refresh token',
  })
  rt: string;
}

export class LoginResponseDto {
  @ApiProperty({
    type: TokensResponseDto,
    description: 'Tokens',
  })
  tokens: TokensResponseDto;

  @ApiProperty({
    type: UserResponseDto,
    description: 'User',
  })
  user: UserResponseDto;
}

export class RefreshRtResponseDto {
  @ApiProperty({
    type: String,
    description: 'Access token',
  })
  accessToken: string;
}

export class EntityIsFreeResponseDto {
  @ApiProperty({
    type: Boolean,
  })
  free: boolean;
}
