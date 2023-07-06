import { IRmqUser } from '@app/types';
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
    optional: true,
    description: 'User name (optional)',
  })
  name?: string;

  @StringField({
    optional: true,
  })
  description?: string;
  @StringField({
    optional: true,
  })
  profilePicture?: string;
}
