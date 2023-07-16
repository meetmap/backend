import { FriendshipStatus, IFriendsBase, IUser } from '@app/types';
import { PipelineStage } from 'mongoose';
import { getFriendsipStatusForUserFromUsersAggregation } from './users.aggregation';

type FieldsToOmit = 'password' | 'refreshToken' | 'fbToken';
export const getFriendsUserListFromFriendsAggregation = <User extends IUser>(
  currentUserCId: string,
  searchUserCId: string,
  usersCollectionName: string = 'users',
): PipelineStage[] => [
  {
    $match: {
      $or: [{ requesterCId: searchUserCId }, { recipientCId: searchUserCId }],
      status: FriendshipStatus.FRIENDS,
    },
  },
  {
    $lookup: {
      from: usersCollectionName,
      localField: 'requesterCId' satisfies keyof IFriendsBase,
      foreignField: 'cid' satisfies keyof IUser,
      as: 'requesterDetails',
    },
  },
  {
    $lookup: {
      from: usersCollectionName,
      localField: 'recipientCId' satisfies keyof IFriendsBase,
      foreignField: 'cid' satisfies keyof IUser,
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
      friendshipStatus: FriendshipStatus.FRIENDS,
    } satisfies Record<
      keyof Omit<IUser, FieldsToOmit> | '_id' | 'friendshipStatus',
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
  User extends IUser,
>(
  userCId: string,
  usersCollectionName: string = 'users',
): PipelineStage[] => [
  {
    $match: {
      recipientCId: userCId,
      status: FriendshipStatus.REQUESTED,
    },
  },
  {
    $lookup: {
      from: usersCollectionName,
      localField: 'requesterCId' satisfies keyof IFriendsBase,
      foreignField: 'cid' satisfies keyof IUser,
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
      friendshipStatus: FriendshipStatus.PENDING,
    } satisfies Record<
      keyof Omit<IUser, FieldsToOmit> | '_id' | 'friendshipStatus',
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
  User extends IUser,
>(
  userCId: string,
  usersCollectionName: string = 'users',
): PipelineStage[] => [
  {
    $match: {
      requesterCId: userCId,
      status: FriendshipStatus.REQUESTED,
    },
  },
  {
    $lookup: {
      from: usersCollectionName,
      localField: 'recipientCId' satisfies keyof IFriendsBase,
      foreignField: 'cid' satisfies keyof IUser,
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
      friendshipStatus: FriendshipStatus.REQUESTED,
    } satisfies Record<
      keyof Omit<IUser, FieldsToOmit> | '_id' | 'friendshipStatus',
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
  User extends Partial<IUser>,
> = Omit<User, FieldsToOmit> & {
  friendshipStatus: FriendshipStatus | null;
};
