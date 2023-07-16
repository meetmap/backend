import { ILocationServiceUser } from '@app/types';
import { IdField, StringField } from '../decorators';

export class UserLocationResponseDto implements ILocationServiceUser {
  @IdField()
  cid: string;
  @IdField()
  id: string;
  @StringField()
  username: string;
  @StringField({
    optional: true,
  })
  name?: string | undefined;
  @StringField({
    optional: true,
  })
  profilePicture?: string | undefined;
}
