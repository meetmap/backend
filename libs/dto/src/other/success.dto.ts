import { BooleanField } from '../decorators';

export class SuccessResponseDto {
  @BooleanField()
  success: boolean;
}
