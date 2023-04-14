import { JwtPayload } from 'jsonwebtoken';

export interface IJwtPayload extends JwtPayload {
  sub: string;
  username: string;
  expiresAt: string;
}
