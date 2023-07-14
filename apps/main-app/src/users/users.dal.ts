import { MainAppDatabase } from '@app/database';
import {
  IGetUserListWithFriendshipStatusAggregationResult,
  sortUsersAggregationPipeline,
} from '@app/database/shared-aggregations';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import { S3UploaderService } from '@app/s3-uploader';
import { IMainAppFriends, IMainAppUser, IRmqUser } from '@app/types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as mongoose from 'mongoose';
import * as path from 'path';

@Injectable()
export class UsersDal implements OnModuleInit {
  private dataManipulation: CommonDataManipulation<
    IMainAppFriends,
    IMainAppUser
  >;
  constructor(
    private readonly db: MainAppDatabase,
    private readonly s3Service: S3UploaderService,
  ) {}
  onModuleInit() {
    this.dataManipulation = new CommonDataManipulation(
      this.db.models.friends,
      this.db.models.users,
    );
  }
  public async createUser(
    payload: Pick<
      IRmqUser,
      | 'birthDate'
      | 'email'
      | 'username'
      | 'phone'
      // | 'authUserId'
      | 'cid'
      | 'fbId'
      | 'name'
    >,
  ) {
    const user = await this.db.models.users.create({
      birthDate: payload.birthDate,
      email: payload.email,
      username: payload.username,
      phone: payload.phone,
      // authUserId: payload.authUserId,
      cid: payload.cid,
      fbId: payload.fbId,
      name: payload.name,
    });
    return user.toObject();
  }

  public async getFriendsCids(userId: string) {
    const response = await this.db.models.friends.aggregate<{ cid: string }>([
      {
        $match: {
          status: 'friends',
          requester: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'recipient',
          foreignField: '_id',
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
          _id: 0,
          cid: 1,
        },
      },
    ]);
    return response.map(({ cid }) => cid); // response.map(({ friends }) => friends);
  }

  public async getUserFriends(cid: string) {
    return await this.dataManipulation.friends.getUserFriends(cid, 0, 0);
  }

  public async updateUser(
    cid: string,
    payload: Partial<
      Pick<
        IMainAppUser,
        | 'phone'
        | 'email'
        | 'username'
        | 'name'
        | 'fbId'
        | 'description'
        | 'profilePicture'
      >
    >,
  ) {
    const user = await this.db.models.users.findOneAndUpdate(
      {
        cid: cid,
      },
      {
        $set: {
          phone: payload.phone,
          email: payload.email,
          username: payload.username,
          name: payload.name,
          fbId: payload.fbId,
          description: payload.description,
          profilePicture: payload.profilePicture,
        },
      },
      {
        new: true,
      },
    );
    return user?.toObject();
  }

  public async deleteUser(cid: string) {
    //delete user
    const user = await this.db.models.users.findOneAndDelete({
      cid: cid,
    });
    if (!user) {
      return;
    }
    //pull out this user from friends list of every friend
    await this.db.models.users.updateMany(
      {
        friendsCIds: user.id,
      },
      {
        $pull: {
          friendsCIds: user.id,
        },
      },
    );
    //delete all friends recordings where this user
    await this.db.models.friends.deleteMany({
      $or: [
        { recipient: user.id },
        {
          requester: user.id,
        },
      ],
    });
    return user.id;
  }

  public async findUserByEmail(email: string) {
    return await this.db.models.users.findOne({
      email: email,
    });
  }

  public async findUsersByQueryUsername(userCId: string, query: string) {
    return await this.dataManipulation.users
      .getUsersWithFriendshipStatus(
        userCId,
        [
          {
            $match: {
              $or: [
                {
                  username: new RegExp(query, 'i'),
                },
                {
                  description: new RegExp(query, 'i'),
                },
                {
                  name: new RegExp(query, 'i'),
                },
              ],
            },
          },
        ],
        sortUsersAggregationPipeline,
      )
      .limit(15);
  }

  public async findUserByCId(cid: string) {
    const user = await this.db.models.users.findOne({ cid });
    return user?.toObject();
  }

  public async findUserByCidWithFirends(
    currentUserCId: string,
    cid: string,
  ): Promise<IGetUserListWithFriendshipStatusAggregationResult<IMainAppUser> | null> {
    const [user] =
      await this.dataManipulation.users.getUsersWithFriendshipStatus(
        currentUserCId,
        [
          {
            $match: {
              cid: cid,
            } satisfies Partial<Record<keyof IMainAppUser, any>>,
          },
        ],
      );
    return user ?? null;
  }

  public async findUserByUsername(username: string) {
    return await this.db.models.users.findOne({
      username: username,
    });
  }

  public async findUserByPhone(phone: string) {
    return await this.db.models.users.findOne({
      phone: phone,
    });
  }

  public async uploadUserProfilePicture(
    cid: string,
    file: Express.Multer.File,
  ) {
    const { url } = await this.s3Service.upload(
      'users-assets/'
        .concat(cid + '_profile-picture_' + randomUUID())
        .concat(path.extname(file.originalname)),
      file.buffer,
    );
    return url;
  }
}
