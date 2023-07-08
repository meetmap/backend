import { IFriendsBase, IUser } from '@app/types';
import { PipelineStage } from 'mongoose';

type FieldsToOmit = 'password' | 'refreshToken' | 'fbToken' | 'friendsCIds';
export const getUserListFromFriendsAggregation = <User extends IUser>(
  from: 'requester' | 'recipient',
  usersCollectionName = 'users',
): PipelineStage[] => [
  {
    $lookup: {
      from: usersCollectionName,
      // localField: 'recipient',
      localField: (from === 'requester'
        ? 'requesterCId'
        : 'recipientCId') satisfies keyof IFriendsBase,
      foreignField: 'cid' satisfies keyof User,
      as: 'friends',
    },
  },
  {
    $unwind: {
      path: '$friends',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      friends: 1,
    },
  },
  {
    $replaceRoot: {
      newRoot: '$friends',
    },
  },
  {
    $project: {
      username: 1,
      email: 1,
      phone: 1,
      birthDate: 1,
      //   friendsCIds: 1,
      cid: 1,
      description: 1,
      fbId: 1,
      name: 1,
      profilePicture: 1,
      createdAt: 1,
      id: 1,
      updatedAt: 1,
    } satisfies Record<keyof Omit<IUser, FieldsToOmit>, 1>,
  },
  {
    $addFields: {
      id: {
        $toString: '$_id',
      },
    },
  },
];

export type IGetUserListFromFriendsAggregationResult<
  User extends Partial<IUser>,
> = Omit<User, FieldsToOmit>;
