import { EventsServiceDatabase } from '@app/database';
import { AppTypes } from '@app/types';

import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { Request } from 'express';

@Injectable()
export class IsAuthenticatedApiGuard implements CanActivate {
  constructor(private readonly db: EventsServiceDatabase) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const apiKey = request.headers['x-api-key'];

      if (!apiKey) {
        throw new ForbiddenException('Api key required');
      }
      const dbResponse = await this.db.models.apiKey
        .findOne<{
          issuedTo: AppTypes.TicketingPlatforms.System.ITicketingPlatform;
        } | null>({
          key: apiKey,
        })
        .populate(
          'issuedTo' satisfies keyof AppTypes.TicketingPlatforms.System.IApiKey,
        )
        .select(
          'issuedTo' satisfies keyof AppTypes.TicketingPlatforms.System.IApiKey,
        );

      if (!dbResponse || !dbResponse.issuedTo) {
        throw new ForbiddenException('Invalid Api key');
      }

      const platform = dbResponse.issuedTo;
      //@ts-ignore
      request.platform = platform;
      return true;
    } catch (error) {
      console.error(error);
      throw new ForbiddenException('Invalid token');
    }
  }
}

export const UseApiAuthGuard = () =>
  applyDecorators(
    ApiSecurity('ticketingPlatformApiAuth'),
    UseGuards(IsAuthenticatedApiGuard),
  );
