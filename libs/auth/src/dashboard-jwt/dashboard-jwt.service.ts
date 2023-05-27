import { Injectable } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { IJwtDashboardPayload, IJwtUserPayload } from '@app/types/jwt';

interface IJwtOptions {
  secret: string;
  maxAge: string | number;
}

@Injectable()
export class JwtService {
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

  async getTokens(payload: Pick<IJwtDashboardPayload, 'sub' | 'companyName'>) {
    const at = await this.signAt(payload);
    const rt = await this.signRt(payload);
    return { rt, at };
  }

  public async verifyRt(rt: string): Promise<IJwtDashboardPayload> {
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
            : res(dec as IJwtDashboardPayload);
        },
      );
    });
  }

  public async verifyAt(at: string): Promise<IJwtDashboardPayload> {
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
            : res(dec as IJwtDashboardPayload);
        },
      );
    });
  }

  private async signRt(
    payload: Pick<IJwtDashboardPayload, 'sub' | 'companyName'>,
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
    payload: Pick<IJwtDashboardPayload, 'sub' | 'companyName'>,
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
