import { Global, Module } from '@nestjs/common';
import { AiProcessingService } from './ai-processing.service';

@Global()
@Module({
  providers: [AiProcessingService],
  exports: [AiProcessingService],
})
export class AiProcessingModule {}
