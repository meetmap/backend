import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';

export abstract class BaseDto {
  static create<T extends BaseDto>(this: new () => T, data: T): T {
    const dto = Object.assign(new this(), data);
    // const errors = validateSync(dto);
    // if (errors.length > 0) {
    //   console.log(errors);
    //   throw new Error('Validation failed!');
    // }
    return dto;
  }

  static async createAndValidate<T extends BaseDto>(
    this: new () => T,
    data: T,
  ): Promise<T> {
    const dto = Object.assign(new this(), data);
    const errors = await validate(dto);
    if (errors.length > 0) {
      console.log(errors);
      throw new BadRequestException(errors);
    }
    return dto;
  }
}

type IsAny<T> = 0 extends 1 & T ? true : false;
