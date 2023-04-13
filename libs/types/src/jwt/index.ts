import { JwtPayload } from 'jsonwebtoken';

export interface IJwtPayload extends JwtPayload {
  sub: string;
  expiresAt: string;
}
