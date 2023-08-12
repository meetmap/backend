import { RMQConstants } from '@app/constants';
import { AppDto } from '@app/dto';
import { RabbitmqService } from '@app/rabbitmq';
import { AppTypes } from '@app/types';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class LastTimeOnlineInterceptor implements NestInterceptor {
  constructor(private readonly rmqService: RabbitmqService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();
    //@ts-ignore
    const jwtPayload: AppTypes.JWT.User.IJwtPayload | null = req.jwtPayload;
    if (jwtPayload) {
      await this.rmqService.amqp.publish(
        RMQConstants.exchanges.USERS.name,
        RMQConstants.exchanges.USERS.routingKeys.USER_UPDATED,
        AppDto.TransportDto.Users.UserUpdatedRmqRequestDto.create({
          cid: jwtPayload.cid,
          lastTimeOnline: new Date(),
        }),
        {
          expiration: 30 * 1000,
        },
      );
    }
    // console.log({

    //   lastTime: req.jwtPayload,
    // });
    return next.handle();
  }
}
