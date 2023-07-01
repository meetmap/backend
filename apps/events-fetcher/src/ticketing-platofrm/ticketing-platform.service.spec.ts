import { Test, TestingModule } from '@nestjs/testing';
import { TicketingPlatformService } from './ticketing-platform.service';

describe('TicketingPlatformService', () => {
  let service: TicketingPlatformService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketingPlatformService],
    }).compile();

    service = module.get<TicketingPlatformService>(TicketingPlatformService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
