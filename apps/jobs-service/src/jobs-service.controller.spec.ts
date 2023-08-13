import { Test, TestingModule } from '@nestjs/testing';
import { JobsServiceController } from './jobs-service.controller';
import { JobsServiceService } from './jobs-service.service';

describe('JobsServiceController', () => {
  let jobsServiceController: JobsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [JobsServiceController],
      providers: [JobsServiceService],
    }).compile();

    jobsServiceController = app.get<JobsServiceController>(JobsServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(jobsServiceController.getHello()).toBe('Hello World!');
    });
  });
});
