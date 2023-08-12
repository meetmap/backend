import { IAuthProviderUser } from '@app/auth-providers/types';
import { AuthServiceDatabase } from '@app/database';
import { AppTypes } from '@app/types';

import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

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
    } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.AuthService.Users.IUser>);
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
    } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.AuthService.Users.IUser>);
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

  public async findUserByCid(
    userCid: string,
  ): Promise<AppTypes.AuthService.Users.IUser | null> {
    return await this.db.models.users.findOne({ cid: userCid });
  }

  public async updateUsersRefreshToken(userCid: string, refreshToken: string) {
    return await this.db.models.users.findOneAndUpdate(
      {
        cid: userCid,
      },
      {
        $set: {
          refreshToken: refreshToken,
        },
      },
    );
  }

  public async linkFbToUser(userCid: string, fbUser: IAuthProviderUser) {
    return await this.db.models.users.findOne(
      { cid: userCid },
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
    cid: string,
    payload: Partial<
      Pick<
        AppTypes.AuthService.Users.IUser,
        'email' | 'phone' | 'password' | 'username' | 'name' | 'lastTimeOnline'
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
    return this.db.models.users.findOneAndUpdate<AppTypes.AuthService.Users.ISafeUser>(
      { cid },
      {
        $set: {
          password: payload.password
            ? await this.hashPassword(payload.password)
            : undefined,
          email: payload.email,
          phone: payload.phone,
          username: payload.username,
          name: payload.name,
          lastTimeOnline: payload.lastTimeOnline,
        },
      },
      {
        new: true,
      },
    );
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
