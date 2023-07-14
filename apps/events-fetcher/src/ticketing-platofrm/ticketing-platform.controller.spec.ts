import { Test, TestingModule } from '@nestjs/testing';
import { TicketingPlatformController } from './ticketing-platform.controller';
import { TicketingPlatformService } from './ticketing-platform.service';

describe('TicketingPlatformController', () => {
  let controller: TicketingPlatformController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketingPlatformController],
      providers: [TicketingPlatformService],
    }).compile();

    controller = module.get<TicketingPlatformController>(
      TicketingPlatformController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
