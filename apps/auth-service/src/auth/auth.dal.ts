import { AuthServiceDatabase } from '@app/database';
import { IAuthUser, IAuthUserWithPassword, ISafeAuthUser } from '@app/types';
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as mongoose from 'mongoose';

@Injectable()
export class AuthDal {
  constructor(private readonly db: AuthServiceDatabase) {}
  public async createUser(
    payload: Pick<
      IAuthUserWithPassword,
      'email' | 'username' | 'phone' | 'password' | 'birthDate'
    >,
  ) {
    return await this.db.models.users.create({
      email: payload.email,
      username: payload.username,
      phone: payload.phone,
      password: await this.hashPassword(payload.password),
      birthDate: payload.birthDate,
      cid: randomUUID(),
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

  public async findUserById(userId: string): Promise<IAuthUser | null> {
    return await this.db.models.users.findById(userId);
  }

  public async updateUsersRefreshToken(userId: string, refreshToken: string) {
    return await this.db.models.users.findByIdAndUpdate(userId, {
      $set: {
        refreshToken: refreshToken,
      },
    });
  }

  public async updateUser(
    id: string,
    payload: Partial<
      Pick<IAuthUser, 'email' | 'phone' | 'password' | 'username'>
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
    return this.db.models.users.findByIdAndUpdate<ISafeAuthUser>(
      id,
      {
        $set: {
          password: payload.password
            ? await this.hashPassword(payload.password)
            : undefined,
          email: payload.email,
          phone: payload.phone,
          username: payload.username,
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
  ): Promise<(IAuthUser | null)[]> {
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
