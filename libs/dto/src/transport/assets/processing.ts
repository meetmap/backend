import { BaseDto } from '@app/dto/base';
import { BooleanField, StringField } from '@app/dto/decorators';

export class BatchFailed extends BaseDto {
  @StringField()
  batchId: string;
  @BooleanField()
  canBeRetried: boolean;

  @StringField()
  failureReason: string;
}
