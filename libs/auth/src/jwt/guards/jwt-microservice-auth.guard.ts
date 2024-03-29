import { LastTimeOnlineInterceptor } from '@app/auth/other';
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtService } from '../jwt.service';

@Injectable()
export class IsAuthenticatedMicroserviceGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const authToken = request.headers.authorization?.split(' ')[1];
      if (!authToken) {
        throw new ForbiddenException('Auth token required');
      }
      const payload = await this.jwtService.verifyAt(authToken);
      //@ts-ignore
      request.jwtPayload = payload;
      return true;
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('Invalid token');
    }
  }
}

export const UseMicroserviceAuthGuard = (
  config: { disableLastTimeOnline: boolean } = { disableLastTimeOnline: false },
) =>
  applyDecorators(
    ApiBearerAuth('microserviceAuth'),
    UseGuards(IsAuthenticatedMicroserviceGuard),
    ...(config.disableLastTimeOnline
      ? []
      : [UseInterceptors(LastTimeOnlineInterceptor)]),
  );
