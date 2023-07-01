import { MainAppDatabase } from '@app/database';
import { IMainAppUser } from '@app/types';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';

@Injectable()
export class UsersDal {
  constructor(private readonly db: MainAppDatabase) {}
  public async createUser(
    payload: Pick<
      IMainAppUser,
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
      Pick<IMainAppUser, 'username' | 'phone' | 'email' | 'name'>
    >,
  ) {
    return await this.db.models.users.findOneAndUpdate(
      {
        cid: cid,
      },
      {
        $set: {
          username: payload.username,
          email: payload.email,
          phone: payload.phone,
          name: payload.name,
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

  public async comparePassword(password: string, hash?: string) {
    if (!hash) {
      return false;
    }
    return await bcrypt.compare(password, hash);
  }

  public async hashPassword(password: string) {
    return await bcrypt.hash(password, 12);
  }

  public async findUserByEmail(email: string) {
    return await this.db.models.users.findOne({
      email: email,
    });
  }

  public async findUsersByQueryUsername(query: string) {
    return await this.db.models.users
      .find({
        username: new RegExp(query, 'i'),
      })
      .limit(15);
  }

  public async findUserById(userId: string): Promise<IMainAppUser | null> {
    return await this.db.models.users.findById(userId);
  }

  public async findUserByCid(cid: string): Promise<IMainAppUser | null> {
    return await this.db.models.users.findOne({ cid });
  }

  public async findUserByCorrelationId(
    cid: string,
  ): Promise<IMainAppUser | null> {
    return await this.db.models.users.findOne({
      cid: cid,
    });
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
}
