import { IdField } from '@app/dto/decorators';

export class UpdateFriendshipRequestDto {
  @IdField()
  friendCId: string;
}
