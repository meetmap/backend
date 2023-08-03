import { Shared } from '@app/types/shared';
import { ObjectId } from 'mongoose';

export interface IUser extends Shared.Users.IUsersBase {
  profilePicture?: ObjectId;
}
