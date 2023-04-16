import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestFriendshipDto {
  @ApiProperty({
    type: String,
    description: 'Username',
  })
  @IsString()
  username: string;
}

export class AcceptFriendshipRequestDto {
  @ApiProperty({
    type: String,
    description: 'freindId',
  })
  @IsString()
  friendId: string;
}

export class RejectFriendshipRequestDto {
  @ApiProperty({
    type: String,
    description: 'friendId',
  })
  @IsString()
  friendId: string;
}

export class GetFriendsRequestDto {
  @ApiProperty({
    type: String,
    description: 'friendId',
  })
  @IsString()
  friendId: string;
}

export class SuccessResponse {
  @ApiProperty({
    type: Boolean,
    description: 'success',
  })
  @IsBoolean()
  success: boolean;
}
