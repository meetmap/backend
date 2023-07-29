import { Test, TestingModule } from '@nestjs/testing';
import { MainAppController } from './users-service.controller';
import { MainAppService } from './users-service.service';

describe('MainAppController', () => {
  let mainAppController: MainAppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MainAppController],
      providers: [MainAppService],
    }).compile();

    mainAppController = app.get<MainAppController>(MainAppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mainAppController.getHello()).toBe('Hello World!');
    });
  });
});
