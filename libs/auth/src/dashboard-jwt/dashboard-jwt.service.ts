import { Injectable } from '@nestjs/common';

import { AppTypes } from '@app/types';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

interface IJwtOptions {
  secret: string;
  maxAge: string | number;
}

@Injectable()
export class DashboardJwtService {
  private readonly jwtAt: IJwtOptions;
  private readonly jwtRt: IJwtOptions;
  constructor(private readonly configService: ConfigService) {
    this.jwtAt = {
      secret: configService.getOrThrow('DASHBOARD_JWT_AT_SECRET'),
      maxAge: configService.getOrThrow('DASHBOARD_JWT_AT_EXPIRES'),
    };
    this.jwtRt = {
      secret: configService.getOrThrow('DASHBOARD_JWT_RT_SECRET'),
      maxAge: configService.getOrThrow('DASHBOARD_JWT_RT_EXPIRES'),
    };
  }
  async getAt(refreshToken: string) {
    const { sub, companyName } = await this.verifyRt(refreshToken);
    const at = await this.signAt({ sub, companyName });
    return at;
  }

  async getTokens(
    payload: Pick<AppTypes.JWT.Dashboard.IJwtPayload, 'sub' | 'companyName'>,
  ) {
    const at = await this.signAt(payload);
    const rt = await this.signRt(payload);
    return { rt, at };
  }

  public async verifyRt(
    rt: string,
  ): Promise<AppTypes.JWT.Dashboard.IJwtPayload> {
    return new Promise((res, rej) => {
      jwt.verify(
        rt,
        this.jwtRt.secret,
        {
          maxAge: this.jwtRt.maxAge,
        },
        (err, dec) => {
          if (err) return rej(err);
          typeof dec === 'string'
            ? rej('Invalid jwt')
            : res(dec as AppTypes.JWT.Dashboard.IJwtPayload);
        },
      );
    });
  }

  public async verifyAt(
    at: string,
  ): Promise<AppTypes.JWT.Dashboard.IJwtPayload> {
    return new Promise((res, rej) => {
      jwt.verify(
        at,
        this.jwtAt.secret,
        {
          maxAge: this.jwtAt.maxAge,
        },
        (err, dec) => {
          if (err) return rej(err);
          typeof dec === 'string'
            ? rej('Invalid jwt')
            : res(dec as AppTypes.JWT.Dashboard.IJwtPayload);
        },
      );
    });
  }

  private async signRt(
    payload: Pick<AppTypes.JWT.Dashboard.IJwtPayload, 'sub' | 'companyName'>,
  ): Promise<string> {
    return new Promise((res, rej) => {
      jwt.sign(
        payload,
        this.jwtRt.secret,
        {
          expiresIn: this.jwtRt.maxAge,
        },
        (err, dec) => {
          if (err) return rej(err);
          if (!dec) {
            return rej(err);
          }
          res(dec);
        },
      );
    });
  }

  private async signAt(
    payload: Pick<AppTypes.JWT.Dashboard.IJwtPayload, 'sub' | 'companyName'>,
  ): Promise<string> {
    return new Promise((res, rej) => {
      jwt.sign(
        payload,
        this.jwtAt.secret,
        {
          expiresIn: this.jwtAt.maxAge,
        },
        (err, dec) => {
          if (err) return rej(err);
          if (!dec) {
            return rej(err);
          }
          res(dec);
        },
      );
    });
  }
}
