import { IdField, StringField } from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class UsersServiceFriendsSnapshotRequestDto
  implements AppTypes.Transport.Snapshot.Friends.IUsersServiceSnapshot
{
  @IdField()
  requesterCId: string;
  @IdField()
  recipientCId: string;
  @StringField({
    enum: AppTypes.Shared.Friends.FriendshipStatus,
  })
  status: AppTypes.Shared.Friends.FriendshipStatus;
}

export class UpdateFriendshipRMQRequestDto {
  @IdField()
  userCId: string;

  @IdField()
  friendCId: string;
}
