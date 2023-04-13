import { MainAppDatabase } from '@app/database';
import { IUser, IUserWithPassword } from '@app/types';
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersDal {
  constructor(private readonly db: MainAppDatabase) {}
  public async createUser(
    payload: Pick<
      IUserWithPassword,
      'birthDate' | 'email' | 'username' | 'phone' | 'password'
    >,
  ) {
    return await this.db.models.users.create({
      birthDate: payload.birthDate,
      email: payload.email,
      username: payload.username,
      phone: payload.phone,
      password: await this.hashPassword(payload.password),
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

  public async updateUsersRefreshToken(userId: string, refreshToken: string) {
    return await this.db.models.users.findByIdAndUpdate(userId, {
      $set: {
        refreshToken: refreshToken,
      },
    });
  }

  public async updateUser(
    id: string,
    payload: Partial<Pick<IUser, 'email' | 'phone' | 'password' | 'username'>>,
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
    return this.db.models.users.findByIdAndUpdate(id, {
      $set: {
        password: payload.password
          ? await this.hashPassword(payload.password)
          : undefined,
        email: payload.email,
        phone: payload.phone,
        username: payload.username,
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
