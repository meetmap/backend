import { Test, TestingModule } from '@nestjs/testing';
import { MainAppController } from './main-app.controller';
import { MainAppService } from './main-app.service';

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
