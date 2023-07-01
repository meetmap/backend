import {
  Strategy as _FacebookStrategy,
  StrategyOption,
  StrategyOptionWithRequest,
  VerifyFunction,
  VerifyFunctionWithRequest,
} from 'passport-facebook';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { applyDecorators, UseGuards } from '@nestjs/common';

export class FacebookStrategy extends PassportStrategy(
  _FacebookStrategy,
  'facebook',
) {
  constructor() {
    super({
      clientID: '225690640359810',
      clientSecret: 'af51c2eab00f5e187a9688a728afab8f',
      callbackURL: 'http://localhost:3003/auth-service/auth/facebook/redirect',
      scope: ['email', 'public_profile', 'user_friends'],
      profileFields: [
        'id',
        'displayName',
        // 'photos',
        'picture',
        'email',
        'birthday',
        'gender',
        'friends',
      ],
      passReqToCallback: true,
    } satisfies (StrategyOptionWithRequest | StrategyOption) & { scope: string[] });
  }
  validate: VerifyFunctionWithRequest = async (
    req,
    accessToken,
    refreshToken,
    profile,
    done,
  ) => {
    console.log(req.user);
    const { name, emails, birthday, gender, id } = profile;
    const email = emails?.[0].value;
    console.log(accessToken);
    if (!email) {
      done('Email not provided');
      return;
    }
    if (!name) {
      done('Name not provided');
      return;
    }
    if (!gender) {
      done('Gender not provided');
      return;
    }
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      birthday,
      id,
    };
    console.log({ user });
    const payload = {
      user,
      accessToken,
    };

    done(null, payload);
  };
}

export const UseFacebookAuthGuard = () =>
  applyDecorators(UseGuards(AuthGuard('facebook')));
