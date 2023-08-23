import { Test, TestingModule } from '@nestjs/testing';
import { SearchJobsService } from './search-jobs.service';

describe('SearchJobsService', () => {
  let service: SearchJobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchJobsService],
    }).compile();

    service = module.get<SearchJobsService>(SearchJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
