import { Module } from '@nestjs/common';
import { TicketingPlatformService } from './ticketing-platform.service';
import { TicketingPlatformController } from './ticketing-platform.controller';
import { TicketingPlatformDal } from './ticketing-platform.dal';

@Module({
  controllers: [TicketingPlatformController],
  providers: [TicketingPlatformService, TicketingPlatformDal],
})
export class TicketingPlatofrmsModule {}
