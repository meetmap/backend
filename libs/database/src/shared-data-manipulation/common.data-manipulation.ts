import { AppTypes } from '@app/types';
import mongoose from 'mongoose';
import { FriendsDataManipulation } from './friends.data-manipulation';
import { UsersDataManipulation } from './users.data-manipulation';

export class CommonDataManipulation<
  Friends extends AppTypes.Shared.Friends.IFriendsBase = AppTypes.Shared.Friends.IFriendsBase,
  Users extends Pick<
    AppTypes.Shared.Users.IUsersBase,
    'cid'
  > = AppTypes.Shared.Users.IUsersBase,
> {
  public readonly users: UsersDataManipulation<Friends, Users>;
  public readonly friends: FriendsDataManipulation<Friends, Users>;
  constructor(
    private readonly friendsModel: mongoose.Model<Friends>,
    private readonly usersModel: mongoose.Model<Users>,
  ) {
    this.users = new UsersDataManipulation(friendsModel, usersModel);
    this.friends = new FriendsDataManipulation<Friends, Users>(
      friendsModel,
      usersModel,
    );
  }
}
