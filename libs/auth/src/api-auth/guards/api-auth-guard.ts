import { EventsFetcherDb } from '@app/database';
import { IApiKey, ITicketingPlatform } from '@app/types';
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
import { Observable } from 'rxjs';

@Injectable()
export class IsAuthenticatedApiGuard implements CanActivate {
  constructor(private readonly db: EventsFetcherDb) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const apiKey = request.headers['x-api-key'];

      if (!apiKey) {
        throw new ForbiddenException('Api key required');
      }
      const dbResponse = await this.db.models.apiKey
        .findOne<{ issuedTo: ITicketingPlatform } | null>({
          key: apiKey,
        })
        .populate('issuedTo' satisfies keyof IApiKey)
        .select('issuedTo' satisfies keyof IApiKey);

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
