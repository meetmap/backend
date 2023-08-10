import { BaseDto } from '@app/dto/base';
import {
  DateField,
  EmailField,
  IdField,
  PhoneField,
  StringField,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class UserUpdatedRmqRequestDto
  extends BaseDto
  implements AppTypes.Transport.Users.IUpdatedUser
{
  @IdField()
  cid: string;

  @PhoneField({ optional: true })
  phone?: string | undefined;

  @EmailField({ optional: true })
  email?: string | undefined;

  @DateField({ optional: true })
  birthDate?: Date | undefined;

  @StringField({ optional: true })
  fbId?: string | undefined;

  @StringField({ optional: true })
  description?: string | undefined;

  @StringField({ optional: true })
  profilePicture?: string | undefined;

  @StringField({ optional: true })
  name?: string | undefined;

  @StringField({ optional: true })
  username?: string | undefined;

  @StringField({ optional: true, enum: AppTypes.Shared.Users.Gender })
  gender?: AppTypes.Shared.Users.Gender | undefined;

  // @EmailField()
  // email: string;

  // @PhoneField({
  //   optional: true,
  // })
  // phone?: string;

  // @StringField({
  //   description: 'Validation will be added soon',
  //   example: 'd4v1ds0n_',
  // })
  // username: string;

  // /**
  //  * @description birthDate should be in ISO 8601 format i.e 2003-04-01T21:00:00.000Z
  //  */
  // @DateField({
  //   description: 'Birth date',
  // })
  // birthDate: Date;

  // @IdField()
  // cid: string;

  // @StringField({
  //   optional: true,
  //   description: 'Facebook id (optional)',
  // })
  // fbId?: string;
  // @StringField({
  //   description: 'User name',
  // })
  // name: string;

  // @StringField({
  //   optional: true,
  // })
  // description?: string;
  // @StringField({
  //   optional: true,
  // })
  // profilePicture?: string;
  // @StringField({
  //   enum: AppTypes.Shared.Users.Gender,
  // })
  // gender: AppTypes.Shared.Users.Gender;
}

export class UserCreatedRmqRequestDto
  extends BaseDto
  implements AppTypes.Transport.Users.ICreatedUser
{
  @PhoneField({ optional: true })
  phone?: string | undefined;

  @EmailField()
  email: string;

  @DateField()
  birthDate: Date;

  @StringField({ optional: true })
  fbId?: string | undefined;

  @IdField()
  cid: string;

  @StringField()
  username: string;

  @StringField()
  name: string;

  @StringField({ enum: AppTypes.Shared.Users.Gender })
  gender: AppTypes.Shared.Users.Gender;
}

export class AuthServiceUserSnapshotRequestDto
  extends BaseDto
  implements AppTypes.Transport.Snapshot.Users.IAuthServiceSnapshot
{
  @PhoneField({ optional: true })
  phone?: string | undefined;
  @EmailField()
  email: string;
  @StringField()
  username: string;
  @DateField()
  birthDate: Date;
  @IdField()
  cid: string;
  @StringField()
  name: string;
  @StringField({
    optional: true,
  })
  fbId?: string | undefined;
  @StringField({ enum: AppTypes.Shared.Users.Gender })
  gender: AppTypes.Shared.Users.Gender;
}

export class UsersServiceUserSnapshotRequestDto
  extends BaseDto
  implements AppTypes.Transport.Snapshot.Users.IUsersServiceSnapshot
{
  @IdField()
  cid: string;
  @StringField({ optional: true })
  description?: string | undefined;
  @StringField({ optional: true })
  profilePicture?: string | undefined;
}
