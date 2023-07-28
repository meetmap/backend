// export interface IUser {
//   id: string;
//   username: string;
//   //@todo name
//   name: string;
//   description?: string;
//   profilePicture?: string;
//   phone?: string;
//   email: string;
//   password?: string;
//   refreshToken?: string;
//   birthDate: Date;
//   createdAt: Date;
//   updatedAt: Date;
//   // authUserId: string;
//   cid: string;
//   //facebook
//   fbId?: string;
//   fbToken?: string;
// }

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

  // description?: string;
  // profilePicture?: string;
  // phone?: string;
  // email: string;
  // password?: string;
  // refreshToken?: string;
  // birthDate: Date;
  // createdAt: Date;
  // updatedAt: Date;
  // // authUserId: string;
  // // cid: string;
  // //facebook
  // fbId?: string;
  // fbToken?: string;
}
