import { IAuthProviderUser } from '@app/auth-providers/types';
import { AuthServiceDatabase } from '@app/database';
import { AppTypes } from '@app/types';

import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as mongoose from 'mongoose';

@Injectable()
export class AuthDal {
  constructor(private readonly db: AuthServiceDatabase) {}
  public async createUser(
    payload: Pick<
      AppTypes.AuthService.Users.IUserWithPassword,
      | 'gender'
      | 'email'
      | 'username'
      | 'phone'
      | 'password'
      | 'birthDate'
      | 'name'
    >,
  ) {
    return await this.db.models.users.create({
      email: payload.email,
      username: payload.username,
      name: payload.name,
      phone: payload.phone,
      gender: payload.gender,
      password: await this.hashPassword(payload.password),
      birthDate: payload.birthDate,
      cid: randomUUID(),
    });
  }

  public async getUserByFbId(fbId: string) {
    return await this.db.models.users.findOne({
      fbId,
    });
  }

  public async createUserWithAuthProvider(
    payload: Pick<
      AppTypes.AuthService.Users.IUser,
      | 'gender'
      | 'email'
      | 'username'
      | 'phone'
      | 'birthDate'
      | 'fbId'
      | 'fbToken'
      | 'name'
    >,
  ) {
    return await this.db.models.users.create({
      email: payload.email,
      username: payload.username,
      phone: payload.phone,
      birthDate: payload.birthDate,
      cid: randomUUID(),
      name: payload.name,
      gender: payload.gender,
      //user has signed in with facebook
      fbId: payload.fbId,
      fbToken: payload.fbToken,
    });
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

  public async findUserById(
    userId: string,
  ): Promise<AppTypes.AuthService.Users.IUser | null> {
    return await this.db.models.users.findById(userId);
  }

  public async updateUsersRefreshToken(userId: string, refreshToken: string) {
    return await this.db.models.users.findByIdAndUpdate(userId, {
      $set: {
        refreshToken: refreshToken,
      },
    });
  }

  public async linkFbToUser(userId: string, fbUser: IAuthProviderUser) {
    return await this.db.models.users.findByIdAndUpdate(
      userId,
      {
        $set: {
          fbId: fbUser.id,
          fbToken: fbUser.token,
        },
      },
      { new: true },
    );
  }

  public async updateUser(
    id: string,
    payload: Partial<
      Pick<
        AppTypes.AuthService.Users.IUser,
        'email' | 'phone' | 'password' | 'username' | 'name'
      >
    >,
  ) {
    if (payload.email && (await this.findUserByEmail(payload.email))) {
      throw new ConflictException(
        `User with email ${payload.email} already exists`,
      );
    }
    if (payload.username && (await this.findUserByUsername(payload.username))) {
      throw new ConflictException(
        `User with username ${payload.username} already exists`,
      );
    }
    if (payload.phone && (await this.findUserByPhone(payload.phone))) {
      throw new ConflictException(
        `User with phone ${payload.phone} already exists`,
      );
    }
    return this.db.models.users.findByIdAndUpdate<AppTypes.AuthService.Users.ISafeUser>(
      id,
      {
        $set: {
          password: payload.password
            ? await this.hashPassword(payload.password)
            : undefined,
          email: payload.email,
          phone: payload.phone,
          username: payload.username,
          name: payload.name,
        },
      },
      {
        new: true,
      },
    );
  }

  public async getUserById(userId: string) {
    return await this.db.models.users.findById(userId);
  }

  public async getUserByIdBulk(
    userIds: string[],
  ): Promise<(AppTypes.AuthService.Users.IUser | null)[]> {
    return await this.db.models.users.find({
      id: {
        $in: userIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
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
