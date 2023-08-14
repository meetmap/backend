import { Module } from '@nestjs/common';
import { SearchJobsDal } from './search-jobs.dal';
import { SearchJobsService } from './search-jobs.service';

@Module({
  providers: [SearchJobsService, SearchJobsDal],
})
export class SearchJobsModule {}
