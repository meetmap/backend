import { IJwtUserPayload } from '@app/types/jwt';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExtractJwtPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IJwtUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.jwtPayload;
  },
);
