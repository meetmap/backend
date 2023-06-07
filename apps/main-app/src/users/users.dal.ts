import { MainAppDatabase } from '@app/database';
import { IAuthUser, IMainAppUser, IUser } from '@app/types';
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';

@Injectable()
export class UsersDal {
  constructor(private readonly db: MainAppDatabase) {}
  public async createUser(
    payload: Pick<
      IMainAppUser,
      'birthDate' | 'email' | 'username' | 'phone' | 'authUserId' | 'cid'
    >,
  ) {
    return await this.db.models.users.create({
      birthDate: payload.birthDate,
      email: payload.email,
      username: payload.username,
      phone: payload.phone,
      friendsIds: [],
      authUserId: payload.authUserId,
      cid: payload.cid,
    });
  }

  public async updateUser(
    cid: string,
    payload: Partial<Pick<IMainAppUser, 'username' | 'phone' | 'email'>>,
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

  public async findUserById(userId: string): Promise<IUser | null> {
    return await this.db.models.users.findById(userId);
  }

  public async findUserByCId(cid: string): Promise<IUser | null> {
    return await this.db.models.users.findOne({ cid });
  }

  public async findUserByCorrelationId(cid: string): Promise<IUser | null> {
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
