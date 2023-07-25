import { FriendshipStatus, IUsersServiceSnapshotFriends } from '@app/types';
import { IdField, StringField } from '../decorators';

export class UsersServiceFriendsSnapshotRequestDto
  implements IUsersServiceSnapshotFriends
{
  @IdField()
  requesterCId: string;
  @IdField()
  recipientCId: string;
  @StringField({
    enum: FriendshipStatus,
  })
  status: FriendshipStatus;
}
