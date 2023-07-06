import { IEventsServiceUser } from '@app/types';
import { DateField, IdField, StringField } from '../decorators';

export class EventsServiceUserResponseDto implements IEventsServiceUser {
  @IdField()
  id: string;
  @StringField({
    description: 'Correlation id',
  })
  cid: string;
  @StringField()
  username: string;
  @StringField({
    optional: true,
  })
  profilePicture?: string;
  @DateField()
  birthDate: Date;
  @StringField({
    optional: true,
  })
  name?: string;
  @StringField({
    optional: true,
  })
  description?: string;
}
