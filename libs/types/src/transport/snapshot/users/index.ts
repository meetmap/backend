import { AuthService } from '@app/types/auth-service';
import { UsersService } from '@app/types/users-service';

export interface IAuthServiceSnapshot
  extends Pick<
    AuthService.Users.ISafeUser,
    | 'phone'
    | 'email'
    | 'username'
    | 'birthDate'
    | 'cid'
    | 'name'
    | 'fbId'
    | 'gender'
  > {}

export interface IUsersServiceSnapshot
  extends Pick<
    UsersService.Users.ISafeUser,
    'cid' | 'name' | 'description' | 'profilePicture'
  > {}
