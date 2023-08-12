import {
  ArgumentMetadata,
  Injectable,
  ParseIntPipe,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParsePagePipe implements PipeTransform<string, Promise<number>> {
  constructor() {}
  async transform(value: string, metadata: ArgumentMetadata) {
    if (typeof value === 'undefined') {
      return 1;
    }
    const parseIntPipe = new ParseIntPipe();
    const page = await parseIntPipe.transform(value, metadata);

    return page < 1 ? 1 : page;
  }
}
