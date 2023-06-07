import { Injectable } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { IJwtUserPayload } from '@app/types/jwt';

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
      secret: configService.getOrThrow('JWT_AT_SECRET'),
      maxAge: configService.getOrThrow('JWT_AT_EXPIRES'),
    };
    this.jwtRt = {
      secret: configService.getOrThrow('JWT_RT_SECRET'),
      maxAge: configService.getOrThrow('JWT_RT_EXPIRES'),
    };
  }
  async getAt(refreshToken: string) {
    const { sub, username, cid } = await this.verifyRt(refreshToken);
    const at = await this.signAt({ sub, username, cid });
    return at;
  }

  async getTokens(payload: Pick<IJwtUserPayload, 'sub' | 'username' | 'cid'>) {
    const at = await this.signAt(payload);
    const rt = await this.signRt(payload);
    return { rt, at };
  }

  public async verifyRt(rt: string): Promise<IJwtUserPayload> {
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
            : res(dec as IJwtUserPayload);
        },
      );
    });
  }

  public async verifyAt(at: string): Promise<IJwtUserPayload> {
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
            : res(dec as IJwtUserPayload);
        },
      );
    });
  }

  private async signRt(
    payload: Pick<IJwtUserPayload, 'sub' | 'username' | 'cid'>,
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
    payload: Pick<IJwtUserPayload, 'sub' | 'username' | 'cid'>,
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
