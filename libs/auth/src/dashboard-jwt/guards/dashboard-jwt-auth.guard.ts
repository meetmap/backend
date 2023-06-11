import {
  AuthServiceDatabase,
  EventsFetcherDb,
  MainAppDatabase,
} from '@app/database';
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DashboardJwtService } from '../dashboard-jwt.service';

@Injectable()
export class IsDashboardAuthenticatedGuard implements CanActivate {
  constructor(
    private readonly jwtService: DashboardJwtService,
    private readonly database: EventsFetcherDb,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const authToken = request.headers.authorization?.split(' ')[1];

      if (!authToken) {
        throw new ForbiddenException('Auth token required');
      }
      const payload = await this.jwtService.verifyAt(authToken);
      const platform = await this.database.models.ticketingPlatform.findById(
        payload.sub,
      );
      if (!platform) {
        throw new ForbiddenException('No such platform');
      }
      //@ts-ignore
      request.platform = platform;
      return true;
    } catch (error) {
      console.error(error);
      throw new ForbiddenException('Invalid token');
    }
  }
}

export const UseDashboardAuthGuard = () =>
  applyDecorators(
    ApiBearerAuth('dashboardAuth'),
    UseGuards(IsDashboardAuthenticatedGuard),
  );
