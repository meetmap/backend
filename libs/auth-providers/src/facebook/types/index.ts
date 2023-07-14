export interface IFacebookUserResponse {
  id: string;
  name: string;
  picture?: {
    data: {
      cache_key: string;
      url: string;
      width: number;
      height: number;
    };
  };
  email?: string;
  gender?: string;
  birthday?: string;
}
