import { Module } from '@nestjs/common';
import { FreindsController } from './friends.controller';
import { FreindsDal } from './friends.dal';
import { FriendsService } from './friends.service';

@Module({
  providers: [FriendsService, FreindsDal],
  controllers: [FreindsController],
})
export class FriendsModule {}
