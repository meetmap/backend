import { IdField } from '../decorators';

export class RequestFriendshipDto {
  @IdField()
  userCId: string;
}

export class UpdateFriendshipRequestDto {
  @IdField()
  friendCId: string;
}

export class UpdateFriendshipRMQRequestDto {
  @IdField()
  userCId: string;

  @IdField()
  friendCId: string;
}
