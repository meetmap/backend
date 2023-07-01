import {
  IMainAppSafePartialUser,
  IMainAppSafeUser,
  ISafeAuthUser,
} from '@app/types';
import {
  DateField,
  EmailField,
  IdField,
  NestedField,
  PhoneField,
  StringField,
} from '../decorators';

export class UserRmqRequestDto implements ISafeAuthUser {
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

  // @StringField({
  //   description: 'userId in auth microservice',
  //   example: '6436b4fa091dc0948e7566c5',
  // })
  // authUserId: string;
  @IdField()
  cid: string;

  @StringField({
    optional: true,
    description: 'Facebook id (optional)',
  })
  fbId?: string;
  @StringField({
    optional: true,
    description: 'User name (optional)',
  })
  name?: string;
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

  @NestedField([String], {
    description: 'Cids of friends or friends(users) array',
    example: ['6436b4ff091dc0948e75671f', '6436b4fa091dc0948e7566c5'],
  })
  friendsCids: string[];

  @IdField()
  cid: string;

  //   @StringField({
  //     description: 'userId in auth microservice',
  //     example: '6436b4fa091dc0948e7566c5',
  //   })
  //   authUserId: string;
}

export class UserPartialResponseDto implements IMainAppSafePartialUser {
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
}
