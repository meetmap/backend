import { AppTypes } from '@app/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExtractJwtPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AppTypes.JWT.User.IJwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.jwtPayload;
  },
);
