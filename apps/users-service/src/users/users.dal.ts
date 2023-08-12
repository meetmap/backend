import { UsersServiceDatabase } from '@app/database';
import {
  IGetUserListWithFriendshipStatusAggregationResult,
  sortUsersAggregationPipeline,
} from '@app/database/shared-aggregations';
import { CommonDataManipulation } from '@app/database/shared-data-manipulation';
import { AppTypes } from '@app/types';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersDal implements OnModuleInit {
  private dataManipulation: CommonDataManipulation<
    AppTypes.UsersService.Friends.IFriends,
    AppTypes.UsersService.Users.IUser
  >;
  constructor(private readonly db: UsersServiceDatabase) {}
  onModuleInit() {
    this.dataManipulation = new CommonDataManipulation(
      this.db.models.friends,
      this.db.models.users,
    );
  }
  public async createUser(payload: AppTypes.Transport.Users.IUser) {
    const user = await this.db.models.users.create({
      birthDate: payload.birthDate,
      email: payload.email,
      username: payload.username,
      phone: payload.phone,
      // authUserId: payload.authUserId,
      cid: payload.cid,
      fbId: payload.fbId,
      name: payload.name,
      gender: payload.gender,
    } satisfies AppTypes.Shared.Helpers.WithoutDocFields<AppTypes.UsersService.Users.IUser>);
    return user.toObject();
  }

  public async getUserFriends(cid: string, page: number = 1) {
    return await this.dataManipulation.friends.getUserFriends(cid, cid, page);
  }

  public async updateUser(
    cid: string,
    payload: Partial<
      Pick<
        AppTypes.UsersService.Users.IUser,
        | 'phone'
        | 'email'
        | 'username'
        | 'name'
        | 'fbId'
        | 'description'
        | 'profilePicture'
        | 'lastTimeOnline'
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
          lastTimeOnline: payload.lastTimeOnline,
        },
      },
      {
        new: true,
      },
    );
    return user?.toObject();
  }

  public async deleteUser(cid: string) {
    await this.db.session((session) =>
      this.dataManipulation.users.deleteUser(cid, session),
    );
    return cid;
  }

  public async findUsersByQueryUsername(
    userCId: string,
    query: string,
    page: number = 1,
  ) {
    return await this.dataManipulation.users.getUsersWithFriendshipStatus(
      userCId,
      page,
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
    );
  }

  public async findUserByCId(cid: string) {
    const user = await this.db.models.users.findOne({ cid });
    return user?.toObject();
  }

  public async findUserByCidWithFriends(
    currentUserCId: string,
    cid: string,
  ): Promise<IGetUserListWithFriendshipStatusAggregationResult<AppTypes.UsersService.Users.IUser> | null> {
    const user = await this.dataManipulation.users.getUserWithFriendshipStatus(
      currentUserCId,
      [
        {
          $match: {
            cid: cid,
          } satisfies Partial<
            Record<keyof AppTypes.UsersService.Users.IUser, any>
          >,
        },
      ],
    );
    return user ?? null;
  }
}
