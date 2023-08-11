import {
  BadRequestException,
  Injectable,
  ParseFilePipe,
  PipeTransform,
} from '@nestjs/common';

export interface IConfig {
  minLength: number;
  maxLength: number;
}

@Injectable()
export class ParseFilesPipe implements PipeTransform<Express.Multer.File[]> {
  constructor(
    private readonly pipe: ParseFilePipe,
    private readonly config: IConfig = { maxLength: 10, minLength: 1 },
  ) {}

  async transform(files: Express.Multer.File[]) {
    if (files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > this.config.maxLength) {
      throw new BadRequestException(`Maximum ${this.config.maxLength} file(s)`);
    }

    if (files.length < this.config.minLength) {
      throw new BadRequestException(`Minimum ${this.config.minLength} file(s)`);
    }

    for (const file of files) await this.pipe.transform(file);

    return files;
  }
}
