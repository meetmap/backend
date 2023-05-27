import { IUser } from '@app/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @description can only be used in auth microservice, otherwise returns undefined
 */
export const ExtractUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
