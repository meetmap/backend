import { BaseDto } from '@app/dto/base';
import {
  DateField,
  IdField,
  NestedField,
  NumberField,
  StringField,
} from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class UserResponseDto
  extends BaseDto
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

export class UserPaginatedResponseDto
  extends BaseDto
  implements
    AppTypes.Other.PaginatedResponse.IPaginatedResponse<UserResponseDto>
{
  @NestedField([UserResponseDto])
  paginatedResults: UserResponseDto[];
  @NumberField()
  totalCount: number;
  @NumberField({ optional: true })
  nextPage?: number | undefined;
}
