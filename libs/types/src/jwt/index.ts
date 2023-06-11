import { JwtPayload } from 'jsonwebtoken';
import { ApiRole } from '../events-api';

export interface IJwtUserPayload extends JwtPayload {
  [key: string]: unknown;
  sub: string;
  username: string;
  expiresAt: string;
  cid: string;
}

// export interface IJwtApipayload extends JwtPayload {
//   [key: string]: unknown;
//   sub: string;
//   companyId: string;
//   expiresAt: string;
// }

export interface IJwtDashboardPayload extends JwtPayload {
  [key: string]: unknown;
  sub: string;
  companyName: string;
  expiresAt: string;
}
