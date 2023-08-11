import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

export interface IParseDatePipeConfig {
  optional?: boolean;
}

@Injectable()
export class ParseDatePipe
  implements PipeTransform<string, Promise<Date | undefined>>
{
  constructor(private readonly config?: IParseDatePipeConfig) {}
  async transform(value: string, metadata: ArgumentMetadata) {
    if (this.config?.optional) {
      return undefined;
    }
    const date = new Date(value);
    if (!dateIsValid) {
      throw new BadRequestException(
        `${metadata.type} ${metadata.data} date is invalid`,
      );
    }
    return date;
  }
}

export const dateIsValid = (date: Date) => {
  return date instanceof Date && !Number.isNaN(+date);
};
