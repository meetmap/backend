import { AppTypes } from '@app/types';
import { PipelineStage } from 'mongoose';
import { getFriendsipStatusForUserFromUsersAggregation } from './users.aggregation';

type FieldsToOmit = 'password' | 'refreshToken' | 'fbToken';
export const getFriendsUserListFromFriendsAggregation = <
  User extends AppTypes.Shared.Users.IUsersBase,
>(
  currentUserCId: string,
  searchUserCId: string,
  usersCollectionName: string = 'users',
): PipelineStage[] => [
  {
    $match: {
      $or: [{ requesterCId: searchUserCId }, { recipientCId: searchUserCId }],
      status: AppTypes.Shared.Friends.FriendshipStatus.FRIENDS,
    },
  },
  {
    $lookup: {
      from: usersCollectionName,
      localField:
        'requesterCId' satisfies keyof AppTypes.Shared.Friends.IFriendsBase,
      foreignField: 'cid' satisfies keyof AppTypes.Shared.Users.IUsersBase,
      as: 'requesterDetails',
    },
  },
  {
    $lookup: {
      from: usersCollectionName,
      localField:
        'recipientCId' satisfies keyof AppTypes.Shared.Friends.IFriendsBase,
      foreignField: 'cid' satisfies keyof AppTypes.Shared.Users.IUsersBase,
      as: 'recipientDetails',
    },
  },
  {
    $project: {
      friend: {
        $cond: {
          if: { $eq: ['$requesterCId', searchUserCId] },
          then: { $arrayElemAt: ['$recipientDetails', 0] },
          else: { $arrayElemAt: ['$requesterDetails', 0] },
        },
      },
    },
  },
  {
    $replaceRoot: { newRoot: '$friend' },
  },
  {
    $project: {
      username: 1,
      email: 1,
      phone: 1,
      birthDate: 1,
      cid: 1,
      description: 1,
      fbId: 1,
      name: 1,
      profilePicture: 1,
      createdAt: 1,
      id: 1,
      updatedAt: 1,
      _id: 1,
      gender: 1,
      lastTimeOnline: 1,
      friendshipStatus: AppTypes.Shared.Friends.FriendshipStatus.FRIENDS,
    } satisfies Record<
      | keyof Omit<AppTypes.Shared.Users.IAnyUser, FieldsToOmit>
      | '_id'
      | 'friendshipStatus',
      1 | any
    >,
  },
  {
    $addFields: {
      id: {
        $toString: '$_id',
      },
    },
  },
  ...getFriendsipStatusForUserFromUsersAggregation(currentUserCId),
];

export const getIncomingRequestsUserListFromFriendsAggregation = <
  User extends AppTypes.Shared.Users.IUsersBase,
>(
  userCId: string,
  usersCollectionName: string = 'users',
): PipelineStage[] => [
  {
    $match: {
      recipientCId: userCId,
      status: AppTypes.Shared.Friends.FriendshipStatus.REQUESTED,
    },
  },
  {
    $lookup: {
      from: usersCollectionName,
      localField:
        'requesterCId' satisfies keyof AppTypes.Shared.Friends.IFriendsBase,
      foreignField: 'cid' satisfies keyof AppTypes.Shared.Users.IUsersBase,
      as: 'requesterDetails',
    },
  },
  {
    $project: {
      requester: { $arrayElemAt: ['$requesterDetails', 0] },
    },
  },
  {
    $replaceRoot: { newRoot: '$requester' },
  },
  {
    $project: {
      username: 1,
      email: 1,
      phone: 1,
      birthDate: 1,
      cid: 1,
      description: 1,
      fbId: 1,
      name: 1,
      profilePicture: 1,
      createdAt: 1,
      id: 1,
      updatedAt: 1,
      _id: 1,
      gender: 1,
      friendshipStatus: AppTypes.Shared.Friends.FriendshipStatus.PENDING,
      lastTimeOnline: 1,
    } satisfies Record<
      | keyof Omit<AppTypes.Shared.Users.IAnyUser, FieldsToOmit>
      | '_id'
      | 'friendshipStatus',
      1 | any
    >,
  },
  {
    $addFields: {
      id: {
        $toString: '$_id',
      },
    },
  },
];

export const getOutcomingRequestsUserListFromFriendsAggregation = <
  User extends AppTypes.Shared.Users.IUsersBase,
>(
  userCId: string,
  usersCollectionName: string = 'users',
): PipelineStage[] => [
  {
    $match: {
      requesterCId: userCId,
      status: AppTypes.Shared.Friends.FriendshipStatus.REQUESTED,
    },
  },
  {
    $lookup: {
      from: usersCollectionName,
      localField:
        'recipientCId' satisfies keyof AppTypes.Shared.Friends.IFriendsBase,
      foreignField: 'cid' satisfies keyof AppTypes.Shared.Users.IUsersBase,
      as: 'recipientDetails',
    },
  },
  {
    $project: {
      recipient: { $arrayElemAt: ['$recipientDetails', 0] },
    },
  },
  {
    $replaceRoot: { newRoot: '$recipient' },
  },
  {
    $project: {
      username: 1,
      email: 1,
      phone: 1,
      birthDate: 1,
      cid: 1,
      description: 1,
      fbId: 1,
      name: 1,
      profilePicture: 1,
      createdAt: 1,
      id: 1,
      updatedAt: 1,
      _id: 1,
      gender: 1,
      friendshipStatus: AppTypes.Shared.Friends.FriendshipStatus.REQUESTED,
      lastTimeOnline: 1,
    } satisfies Record<
      | keyof Omit<AppTypes.Shared.Users.IAnyUser, FieldsToOmit>
      | '_id'
      | 'friendshipStatus',
      1 | any
    >,
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
  User extends Partial<AppTypes.Shared.Users.IUsersBase>,
> = Omit<User, FieldsToOmit> & {
  friendshipStatus: AppTypes.Shared.Friends.FriendshipStatus | null;
};
