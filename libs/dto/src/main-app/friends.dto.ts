import { IdField } from '../decorators';

export class RequestFriendshipDto {
  @IdField()
  userCid: string;
}

export class UpdateFriendshipRequestDto {
  @IdField()
  friendCid: string;
}

export class UpdateFriendshipRMQRequestDto {
  @IdField()
  userCid: string;

  @IdField()
  friendCid: string;
}
