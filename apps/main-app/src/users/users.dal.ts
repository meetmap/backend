import { MainAppDatabase } from '@app/database';
import { S3UploaderService } from '@app/s3-uploader';
import { IMainAppUser, IRmqUser } from '@app/types';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as mongoose from 'mongoose';
import * as path from 'path';

@Injectable()
export class UsersDal {
  constructor(
    private readonly db: MainAppDatabase,
    private readonly s3Service: S3UploaderService,
  ) {}
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
    return await this.db.models.users.create({
      birthDate: payload.birthDate,
      email: payload.email,
      username: payload.username,
      phone: payload.phone,
      friendsIds: [],
      // authUserId: payload.authUserId,
      cid: payload.cid,
      fbId: payload.fbId,
      name: payload.name,
    });
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
    return await this.db.models.users.findOneAndUpdate(
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
        friendsIds: user.id,
      },
      {
        $pull: {
          friendsIds: user.id,
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

  public async findUsersByQueryUsername(query: string) {
    return await this.db.models.users
      .find({
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
      })
      .limit(15);
  }

  public async findUserById(userId: string): Promise<IMainAppUser | null> {
    return await this.db.models.users.findById(userId);
  }

  public async findUserByCid(cid: string) {
    return await this.db.models.users.findOne({ cid });
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
