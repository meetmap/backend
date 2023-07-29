import { JwtPayload } from 'jsonwebtoken';

export interface IJwtPayload extends JwtPayload {
  [key: string]: unknown;
  sub: string;
  username: string;
  expiresAt: string;
  cid: string;
}
