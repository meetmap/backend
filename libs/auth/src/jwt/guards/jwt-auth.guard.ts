import { JwtService } from '@app/auth/jwt/jwt.service';
import { MainAppDatabase } from '@app/database';
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
@Injectable()
export class IsAuthenticatedGuard implements CanActivate {
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
  applyDecorators(UseGuards(IsAuthenticatedGuard));