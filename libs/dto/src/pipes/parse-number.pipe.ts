import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

export interface IParseNumberPipeConfig {
  optional?: boolean;
  default?: number;
  min?: number;
  max?: number;
}

@Injectable()
export class ParseNumberPipe
  implements PipeTransform<string, Promise<number | undefined>>
{
  constructor(
    private readonly config: IParseNumberPipeConfig = {
      optional: false,
    },
  ) {}
  async transform(value: string, metadata: ArgumentMetadata) {
    // const parseIntPipe = new ParseFloatPipe();
    if (typeof value === 'undefined') {
      if (this.config.optional) {
        return this.config.default;
      }
      throw new BadRequestException(
        `${metadata.type} ${metadata.data} is required`,
      );
    }
    const parsedValue = +value;
    if (Number.isNaN(parsedValue)) {
      throw new BadRequestException(
        `${metadata.type} ${metadata.data} expected numeric string`,
      );
    }
    const num = parsedValue;
    if (typeof this.config.min !== 'undefined' && num < this.config.min) {
      throw new BadRequestException(
        `${metadata.type} ${metadata.data} min is (${this.config.min})`,
      );
    }
    if (typeof this.config.max !== 'undefined' && num > this.config.max) {
      throw new BadRequestException(
        `${metadata.type} ${metadata.data} max is (${this.config.max})`,
      );
    }

    return num;
  }
}
