import { PopulatedDoc } from 'mongoose';

export interface ITicketingPlatform {
  id: string;
  email: string;
  password: string;
  /**
   * @description unique
   */
  title: string;

  websiteUrl: string;
  image?: string;
  banner?: string;
  description?: string;
  refreshToken?: string;
}

export interface ISafeTicketingPlatform
  extends Pick<
    ITicketingPlatform,
    'id' | 'title' | 'websiteUrl' | 'image' | 'banner' | 'description'
  > {}

export interface IApiKey {
  id: string;
  title: string;
  description: string;
  key: string;
  createdAt: Date;
  expires?: Date;
  issuedTo: PopulatedDoc<ITicketingPlatform>;
}

export type ApiRole = 'admin';

export interface ISafeApiKey
  extends Pick<
    IApiKey,
    'id' | 'title' | 'description' | 'createdAt' | 'expires'
  > {}
