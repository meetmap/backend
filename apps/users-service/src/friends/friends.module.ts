import { Module } from '@nestjs/common';
import { FreindsController } from './friends.controller';
import { FriendsDal } from './friends.dal';
import { FriendsService } from './friends.service';

@Module({
  providers: [FriendsService, FriendsDal],
  controllers: [FreindsController],
})
export class FriendsModule {}
