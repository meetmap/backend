import { IJwtPayload } from '@app/types/jwt';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ExtractJwtPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IJwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.jwtPayload;
  },
);
