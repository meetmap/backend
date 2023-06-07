import { IFriends, IMainAppSafeUser, ISafeAuthUser } from '@app/types';
import { ApiProperty } from '@nestjs/swagger';
import { PopulatedDoc, Types } from 'mongoose';
import {
  DateField,
  EmailField,
  IdField,
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

  @StringField({
    description: 'userId in auth microservice',
    example: '6436b4fa091dc0948e7566c5',
  })
  authUserId: string;
  @IdField()
  cid: string;
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

  @ApiProperty({
    type: [String],
    description: 'ids of friends or friends(users) array',
    example: ['6436b4ff091dc0948e75671f', '6436b4fa091dc0948e7566c5'],
  })
  friendsIds: PopulatedDoc<IFriends, Types.ObjectId | undefined>[];

  @IdField()
  cid: string;

  //   @StringField({
  //     description: 'userId in auth microservice',
  //     example: '6436b4fa091dc0948e7566c5',
  //   })
  //   authUserId: string;
}
