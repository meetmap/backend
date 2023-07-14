export interface IAuthProviderUser {
  id: string;
  picture: string | null;
  email: string | null;
  phone: string | null;
  birthDate: Date | null;
  name: string | null;
  token: string;
}

export interface IAuthProvider {
  getLongLiveToken(shortLiveToken: string): Promise<string>;
  getUser(longLiveToken: string): Promise<IAuthProviderUser>;
}
