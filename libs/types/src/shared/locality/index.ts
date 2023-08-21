import * as mongoose from 'mongoose';
import { IPoint } from '../location';

export interface ILocality {
  id: string;
  en_name: string;
  // local_name?:string
  google_place_id?: string;
  coordinates?: IPoint;
  countryId?: mongoose.Types.ObjectId;
}
