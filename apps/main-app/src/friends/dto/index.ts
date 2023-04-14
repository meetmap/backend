import { IsString } from 'class-validator';

export class RequestFriendshipDto {
  @IsString()
  username: string;
}

export class AcceptFriendshipRequestDto {
  @IsString()
  friendId: string;
}

export class RejectFriendshipRequestDto {
  @IsString()
  friendId: string;
}

export class GetFriendsRequestDto {
  @IsString()
  friendId: string;
}
