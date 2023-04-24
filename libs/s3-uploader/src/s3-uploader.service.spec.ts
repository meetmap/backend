import { Test, TestingModule } from '@nestjs/testing';
import { S3UploaderService } from './s3-uploader.service';

describe('S3UploaderService', () => {
  let service: S3UploaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3UploaderService],
    }).compile();

    service = module.get<S3UploaderService>(S3UploaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
