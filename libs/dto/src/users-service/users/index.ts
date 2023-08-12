import { BaseDto } from '@app/dto/base';
import {
  DateField,
  EmailField,
  IdField,
  NestedField,
  NumberField,
  PhoneField,
  StringField,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class UserWithoutFriendsResponseDto
  extends BaseDto
  implements AppTypes.UsersService.Users.IUserWithoutFriends
{
  @StringField({
    optional: true,
  })
  description?: string;
  @DateField()
  birthDate: Date;
  @EmailField()
  email: string;
  @PhoneField({
    optional: true,
  })
  phone?: string;
  @StringField()
  username: string;
  @IdField()
  id: string;
  @IdField()
  cid: string;
  @StringField()
  name: string;
  @StringField({
    optional: true,
  })
  profilePicture?: string;
  @StringField({
    optional: true,
  })
  fbId?: string;
  @StringField({
    enum: AppTypes.Shared.Friends.FriendshipStatus,
    nullable: true,
  })
  friendshipStatus: AppTypes.Shared.Friends.FriendshipStatus | null;
  @StringField({
    enum: AppTypes.Shared.Users.Gender,
  })
  gender: AppTypes.Shared.Users.Gender;
  @DateField({ optional: true })
  lastTimeOnline?: Date;
}

export class UserWithoutFriendsPaginatedResponseDto
  extends BaseDto
  implements
    AppTypes.Other.PaginatedResponse
      .IPaginatedResponse<UserWithoutFriendsResponseDto>
{
  @NestedField([UserWithoutFriendsResponseDto])
  paginatedResults: UserWithoutFriendsResponseDto[];
  @NumberField()
  totalCount: number;
  @NumberField({ optional: true })
  nextPage?: number;
}

export class SingleUserResponseDto
  extends BaseDto
  implements AppTypes.UsersService.Users.ISafeUserWithFriends
{
  @IdField()
  id: string;
  @EmailField()
  email: string;

  @PhoneField({ optional: true })
  phone?: string;

  @StringField({
    title: 'Username',
  })
  username: string;

  @DateField({
    description: 'Birth date',
  })
  birthDate: Date;

  @StringField({
    optional: true,
  })
  description?: string;
  @StringField()
  name: string;
  @StringField({
    optional: true,
  })
  profilePicture?: string;
  @StringField({
    optional: true,
  })
  fbId?: string;

  @NestedField(UserWithoutFriendsPaginatedResponseDto)
  friends: UserWithoutFriendsPaginatedResponseDto;

  @IdField()
  cid: string;

  @StringField({
    enum: AppTypes.Shared.Friends.FriendshipStatus,
    optional: true,
  })
  friendshipStatus: AppTypes.Shared.Friends.FriendshipStatus | null;
  @StringField({ enum: AppTypes.Shared.Users.Gender })
  gender: AppTypes.Shared.Users.Gender;
  @DateField({ optional: true })
  lastTimeOnline?: Date;
}

export class UserPartialResponseDto
  extends BaseDto
  implements AppTypes.UsersService.Users.ISafePartialUser
{
  @StringField({
    enum: AppTypes.Shared.Users.Gender,
  })
  gender: AppTypes.Shared.Users.Gender;

  @StringField({
    enum: AppTypes.Shared.Friends.FriendshipStatus,
    nullable: true,
  })
  friendshipStatus: AppTypes.Shared.Friends.FriendshipStatus | null;
  @IdField()
  id: string;
  @EmailField()
  email: string;

  @PhoneField({ optional: true })
  phone?: string;

  @StringField({
    title: 'Username',
  })
  username: string;

  @DateField({
    description: 'Birth date',
  })
  birthDate: Date;

  @IdField()
  cid: string;

  @StringField({
    optional: true,
  })
  description?: string;
  @StringField()
  name: string;
  @StringField({
    optional: true,
  })
  profilePicture?: string;
  @StringField({
    optional: true,
  })
  fbId?: string;
  @DateField({ optional: true })
  lastTimeOnline?: Date;
}

export class UserPartialPaginatedResponseDto
  extends BaseDto
  implements
    AppTypes.Other.PaginatedResponse.IPaginatedResponse<UserPartialResponseDto>
{
  @NestedField([UserPartialResponseDto])
  paginatedResults: UserPartialResponseDto[];
  @NumberField()
  totalCount: number;
  @NumberField({ optional: true })
  nextPage?: number;
}

export class UpdateUserRequestDto extends BaseDto {
  @StringField({
    maxLength: 350,
    description: 'Max 350 symbols',
    optional: true,
  })
  description?: string;

  @StringField({
    maxLength: 100,
    description: 'Max 100 symbols',
    optional: true,
  })
  name?: string;
}
