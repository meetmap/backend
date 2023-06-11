import { ITicketingPlatform } from '@app/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @description can only be used in events-fetcher microservice, under UseDashboardAuthGuard, otherwise returns undefined
 */
export const ExtractPlatform = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ITicketingPlatform => {
    const request = ctx.switchToHttp().getRequest();
    return request.platform;
  },
);
