import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SnapshotDal } from './snapshot.dal';
import { SnapshotService } from './snapshot.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SnapshotService, SnapshotDal],
})
export class SnapshotModule {}
