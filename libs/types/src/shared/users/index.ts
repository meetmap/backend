export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface IUsersBase {
  id: string;
  cid: string;
  username: string;
  name: string;
  gender: Gender;
  createdAt: Date;
  updatedAt: Date;
}
