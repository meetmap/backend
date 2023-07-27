import {
  IAuthServiceSnapshotUser,
  IRmqUser,
  IUsersServiceSnapshotUser,
} from '@app/types';
import {
  DateField,
  EmailField,
  IdField,
  PhoneField,
  StringField,
} from '../decorators';

export class UserRmqRequestDto implements IRmqUser {
  @IdField()
  id: string;

  @EmailField()
  email: string;

  @PhoneField({
    optional: true,
  })
  phone?: string;

  @StringField({
    description: 'Validation will be added soon',
    example: 'd4v1ds0n_',
  })
  username: string;

  /**
   * @description birthDate should be in ISO 8601 format i.e 2003-04-01T21:00:00.000Z
   */
  @DateField({
    description: 'Birth date',
  })
  birthDate: Date;

  @IdField()
  cid: string;

  @StringField({
    optional: true,
    description: 'Facebook id (optional)',
  })
  fbId?: string;
  @StringField({
    description: 'User name',
  })
  name: string;

  @StringField({
    optional: true,
  })
  description?: string;
  @StringField({
    optional: true,
  })
  profilePicture?: string;
}

export class AuthServiceUserSnapshotRequestDto
  implements IAuthServiceSnapshotUser
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
}

export class UsersServiceUserSnapshotRequestDto
  implements IUsersServiceSnapshotUser
{
  @IdField()
  cid: string;
  @StringField()
  name: string;
  @StringField({ optional: true })
  description?: string | undefined;
  @StringField({ optional: true })
  profilePicture?: string | undefined;
}
