import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { IAuthProvider, IAuthProviderUser } from '../types';
import { IFacebookUserResponse } from './types';

@Injectable()
export class FacebookAuthProvider implements IAuthProvider {
  constructor(private readonly configService: ConfigService) {}
  private readonly instance = axios.create({
    baseURL: 'https://graph.facebook.com/v17.0',
  });
  public async getUser(longLiveToken: string): Promise<IAuthProviderUser> {
    try {
      const { data } = await this.instance.get<IFacebookUserResponse>('/me', {
        params: {
          fields: [
            'id',
            'name',
            'email',
            'birthday',
            'picture{cache_key,url,width,height}',
            'gender',
          ].join(','),
          access_token: longLiveToken,
        },
      });
      return {
        birthDate: data.birthday ? new Date(data.birthday) : null,
        email: data.email ?? null,
        id: data.id,
        name: data.name ?? null,
        phone: null,
        picture: data.picture ? data.picture.data.url : null,
        token: longLiveToken,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
        if (error.response?.status === 400) {
          throw new BadRequestException('Failed to get user data from fb');
        }
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  public async getLongLiveToken(shortLiveToken: string) {
    try {
      const { data } = await this.instance.get<{ access_token: string }>(
        '/oauth/access_token',
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: this.configService.getOrThrow('FB_CLIENT_ID'),
            client_secret: this.configService.getOrThrow('FB_CLIENT_SECRET'),
            fb_exchange_token: shortLiveToken,
          },
        },
      );
      return data.access_token;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
        if (error.response?.status === 400) {
          throw new BadRequestException(
            'Failed to obtain access token for user',
          );
        }
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
