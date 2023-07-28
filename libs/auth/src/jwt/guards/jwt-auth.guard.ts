import { JwtService } from '@app/auth/jwt/jwt.service';
import { AuthServiceDatabase } from '@app/database';
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly database: AuthServiceDatabase,
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
    ApiBearerAuth('microserviceAuth'),
    UseGuards(IsAuthenticatedGuard),
  );
