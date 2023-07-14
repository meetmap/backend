import {
  FriendshipStatus,
  IMainAppSafePartialUser,
  IMainAppSafeUser,
  IMainAppSafeUserWithoutFriends,
} from '@app/types';
import {
  DateField,
  EmailField,
  IdField,
  ImageField,
  NestedField,
  PhoneField,
  StringField,
} from '../decorators';

export class UserWithoutFriendsResponseDto
  implements IMainAppSafeUserWithoutFriends
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
  @StringField({
    optional: true,
  })
  name?: string;
  @StringField({
    optional: true,
  })
  profilePicture?: string;
  @StringField({
    optional: true,
  })
  fbId?: string;
  @StringField({
    enum: FriendshipStatus,
    nullable: true,
  })
  friendshipStatus: FriendshipStatus | null;
}

export class UserResponseDto implements IMainAppSafeUser {
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
  @StringField({
    optional: true,
  })
  name?: string;
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
    enum: FriendshipStatus,
  })
  friendshipStatus: FriendshipStatus | null;
}

export class UserPartialResponseDto implements IMainAppSafePartialUser {
  @StringField({
    enum: FriendshipStatus,
    nullable: true,
  })
  friendshipStatus: FriendshipStatus | null;
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
  @StringField({
    optional: true,
  })
  name?: string;
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
