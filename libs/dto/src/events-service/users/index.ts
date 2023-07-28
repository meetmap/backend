import { DateField, IdField, StringField } from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class EventsServiceUserResponseDto
  implements
    Omit<AppTypes.EventsService.Users.IUser, 'createdAt' | 'updatedAt'>
{
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
  @StringField()
  name: string;
  @StringField({
    optional: true,
  })
  description?: string;
  @StringField({ enum: AppTypes.Shared.Users.Gender })
  gender: AppTypes.Shared.Users.Gender;
}
