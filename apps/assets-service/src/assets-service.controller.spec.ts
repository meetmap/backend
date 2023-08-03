import { Test, TestingModule } from '@nestjs/testing';
import { AssetsServiceController } from './assets-service.controller';
import { AssetsServiceService } from './assets-service.service';

describe('AssetsServiceController', () => {
  let assetsServiceController: AssetsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AssetsServiceController],
      providers: [AssetsServiceService],
    }).compile();

    assetsServiceController = app.get<AssetsServiceController>(AssetsServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(assetsServiceController.getHello()).toBe('Hello World!');
    });
  });
});
