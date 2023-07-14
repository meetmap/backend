import { FriendshipStatus, IUser } from '@app/types';
import { PipelineStage } from 'mongoose';

type FieldsToOmit = 'password' | 'refreshToken' | 'fbToken';

/**
 *
 * i.e. null means not friends,
 */
export const getFriendsipStatusForUserFromUsersAggregation = (
  userCId: string,
  friendsCollectionName: string = 'friends',
): PipelineStage[] => [
  {
    $lookup: {
      from: friendsCollectionName,
      let: { userCid: '$cid' },
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                {
                  $and: [
                    { $eq: ['$requesterCId', userCId] },
                    { $eq: ['$recipientCId', '$$userCid'] },
                  ],
                },
                {
                  $and: [
                    { $eq: ['$requesterCId', '$$userCid'] },
                    { $eq: ['$recipientCId', userCId] },
                  ],
                },
              ],
            },
          },
        },
      ],
      as: 'friendshipDetails',
    },
  },
  {
    $unwind: {
      path: '$friendshipDetails',
      preserveNullAndEmptyArrays: true,
    },
  },
  ///if $friendshipDetails.status === null or not exists => null
  ///if $friendshipDetails.requesterCId === userCId => status = FriendshipStatus.REQUESTED
  ///if $friendshipDetails.recipientCId === userCId => status = FriendshipStatus.PENDING
  {
    $addFields: {
      friendshipStatus: {
        $cond: {
          if: { $ifNull: ['$friendshipDetails.status', false] },
          then: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $eq: ['$friendshipDetails.requesterCId', userCId] },
                      //check if status pending or requested, otherwise false

                      {
                        $or: [
                          {
                            $eq: [
                              '$friendshipDetails.status',
                              FriendshipStatus.REQUESTED,
                            ],
                          },
                          {
                            $eq: [
                              '$friendshipDetails.status',
                              FriendshipStatus.PENDING,
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  then: FriendshipStatus.REQUESTED,
                },
                {
                  case: {
                    $and: [
                      { $eq: ['$friendshipDetails.recipientCId', userCId] },
                      //check if status pending or requested, otherwise false
                      {
                        $or: [
                          {
                            $eq: [
                              '$friendshipDetails.status',
                              FriendshipStatus.REQUESTED,
                            ],
                          },
                          {
                            $eq: [
                              '$friendshipDetails.status',
                              FriendshipStatus.PENDING,
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  then: FriendshipStatus.PENDING,
                },
              ],
              default: '$friendshipDetails.status',
            },
          },
          else: null,
        },
      },
    },
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
      friendshipStatus: 1,
    } satisfies Record<
      keyof Omit<IUser, FieldsToOmit> | '_id' | 'friendshipStatus',
      1
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

/**
 * use after {@link getFriendsipStatusForUserFromUsersAggregation}
 *
 * order:
 *  1st - friends
 *
 *  2nd - incoming or outcoming
 *
 *  3rd - other
 */
export const sortUsersAggregationPipeline: PipelineStage[] = [
  {
    $addFields: {
      sortField: {
        $switch: {
          branches: [
            {
              case: { $eq: ['$friendshipDetails.status', 'friends'] },
              then: 1,
            },
            {
              case: {
                $or: [
                  { $eq: ['$friendshipDetails.status', 'incoming'] },
                  { $eq: ['$friendshipDetails.status', 'outcoming'] },
                ],
              },
              then: 2,
            },
          ],
          default: 3,
        },
      },
    },
  },
  {
    $sort: {
      sortField: 1,
    },
  },
  {
    $project: {
      sortField: 0,
    },
  },
];

export type IGetUserListWithFriendshipStatusAggregationResult<
  User extends Partial<IUser>,
> = Omit<User, FieldsToOmit> & {
  friendshipStatus: FriendshipStatus | null;
};
