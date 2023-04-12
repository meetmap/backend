import { Test, TestingModule } from '@nestjs/testing';
import { EventsFetcherController } from './events-fetcher.controller';
import { EventsFetcherService } from './events-fetcher.service';

describe('EventsFetcherController', () => {
  let eventsFetcherController: EventsFetcherController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EventsFetcherController],
      providers: [EventsFetcherService],
    }).compile();

    eventsFetcherController = app.get<EventsFetcherController>(EventsFetcherController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(eventsFetcherController.getHello()).toBe('Hello World!');
    });
  });
});
