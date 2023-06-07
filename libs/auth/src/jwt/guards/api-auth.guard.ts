import { JwtService } from '@app/auth/jwt/jwt.service';
import { MainAppDatabase } from '@app/database';
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
/**
 * @deprecated Probably we don't need it since we are using rmq bus
 */
@Injectable()
export class IsApiAuthenticatedGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly database: MainAppDatabase,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const authToken = request.headers.authorization?.split(' ')[1];
      if (!authToken) {
        throw new ForbiddenException('Auth token required');
      }
      const payload = await this.jwtService.verifyAt(authToken);
      const user = await this.database.models.users.findById(payload.sub);
      if (!user) {
        throw new ForbiddenException('No such user');
      }
      //@ts-ignore
      request.user = user;
      return true;
    } catch (error) {
      console.error(error);
      throw new ForbiddenException('Invalid token');
    }
  }
}

export const UseAuthGuard = () =>
  applyDecorators(
    ApiBearerAuth('Bearer token'),
    UseGuards(IsApiAuthenticatedGuard),
  );
