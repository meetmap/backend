import { JwtPayload } from 'jsonwebtoken';

export interface IJwtPayload extends JwtPayload {
  [key: string]: unknown;
  sub: string;
  companyName: string;
  expiresAt: string;
}
