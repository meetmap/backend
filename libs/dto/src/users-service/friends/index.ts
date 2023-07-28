import { IdField } from '@app/dto/decorators';

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
