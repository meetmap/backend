import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { IJwtApipayload } from '@app/types/jwt';

interface IJwtOptions {
  secret: string;
}

@Injectable()
export class JwtService {
  private readonly jwtAt: IJwtOptions;

  constructor(private readonly configService: ConfigService) {
    this.jwtAt = {
      secret: configService.getOrThrow('API_JWT_AT_SECRET'),
    };
  }
  async getAt(companyId: string) {
    const at = await this.signAt({ sub: companyId, companyId });
    return at;
  }

  async getTokens(payload: Pick<IJwtApipayload, 'sub' | 'companyId'>) {
    const at = await this.signAt(payload);
    return { at };
  }

  public async verifyAt(at: string): Promise<IJwtApipayload> {
    return new Promise((res, rej) => {
      jwt.verify(at, this.jwtAt.secret, {}, (err, dec) => {
        if (err) return rej(err);
        typeof dec === 'string'
          ? rej('Invalid jwt')
          : res(dec as IJwtApipayload);
      });
    });
  }

  private async signAt(
    payload: Pick<IJwtApipayload, 'sub' | 'companyId'>,
  ): Promise<string> {
    return new Promise((res, rej) => {
      jwt.sign(payload, this.jwtAt.secret, {}, (err, dec) => {
        if (err) return rej(err);
        if (!dec) {
          return rej(err);
        }
        res(dec);
      });
    });
  }
}
