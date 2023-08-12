import { DateField, IdField, StringField } from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class UserLocationResponseDto
  implements
    Omit<
      AppTypes.LocationService.Users.IUser,
      'gender' | 'updatedAt' | 'createdAt'
    >
{
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

  @DateField({ optional: true })
  lastTimeOnline?: Date | undefined;
}
