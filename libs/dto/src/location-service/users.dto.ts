import { ILocationServiceUser } from '@app/types';
import { IdField, StringField } from '../decorators';

export class UserLocationResponseDto implements ILocationServiceUser {
  @IdField()
  cid: string;
  @IdField()
  id: string;
  @StringField()
  username: string;
  @StringField()
  name: string;
  @StringField({
    optional: true,
  })
  profilePicture?: string | undefined;
}
