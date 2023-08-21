import * as mongoose from 'mongoose';
import { IMultiPolygon } from '../location';

/**
 * @deprecated remove it, use @see ILocality instead
 */
export interface ICity {
  id: string;
  /**
   * i.e local name
   */
  local_name: string;
  en_name: string;
  countryId: mongoose.Types.ObjectId;
  location: IMultiPolygon;
}
