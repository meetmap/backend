import {
  DateField,
  EmailField,
  IdField,
  ImageField,
  NestedField,
  PhoneField,
  StringField,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class UserWithoutFriendsResponseDto
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
}

export class UserResponseDto implements AppTypes.UsersService.Users.ISafeUser {
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

  @NestedField([UserWithoutFriendsResponseDto], {
    description: 'Cids of friends or friends(users) array',
    example: ['6436b4ff091dc0948e75671f', '6436b4fa091dc0948e7566c5'],
  })
  friends: UserWithoutFriendsResponseDto[];

  @IdField()
  cid: string;

  @StringField({
    enum: AppTypes.Shared.Friends.FriendshipStatus,
    optional: true,
  })
  friendshipStatus: AppTypes.Shared.Friends.FriendshipStatus | null;
  @StringField({ enum: AppTypes.Shared.Users.Gender })
  gender: AppTypes.Shared.Users.Gender;
}

export class UserPartialResponseDto
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
}

export class UpdateUserProfilePictureRequestDto {
  @ImageField()
  photo: Express.Multer.File;
}
