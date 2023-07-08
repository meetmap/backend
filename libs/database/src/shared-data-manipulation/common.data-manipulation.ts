import { IFriendsBase, IUser } from '@app/types';
import mongoose from 'mongoose';
import { FriendsDataManipulation } from './friends.data-manipulation';
import { UsersDataManipulation } from './users.data-manipulation';

export abstract class CommonDataManipulation<
  Friends extends IFriendsBase = IFriendsBase,
  Users extends Pick<IUser, 'cid' | 'friendsCIds'> = IUser,
> {
  public readonly users: UsersDataManipulation;
  public readonly friends: FriendsDataManipulation<Friends, Users>;
  constructor(
    private readonly friendsModel: mongoose.Model<Friends>,
    private readonly usersModel: mongoose.Model<Users>,
  ) {
    this.users = new UsersDataManipulation();
    this.friends = new FriendsDataManipulation<Friends, Users>(
      friendsModel,
      usersModel,
    );
  }
}
