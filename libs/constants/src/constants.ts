import { AppTypes } from '@app/types';

export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9]{6,}$/;
export const MIN_AGE = 12;
export const MAX_AGE = 120;
export const RADIANS_PER_KILOMETER = 1 / 6371.01;

export const SERVER_PREFIX = 'https://api.meetmap.xyz';

export const CORS_ORIGINS = /\\*\.meetmap.xyz|localhost/;

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const getMicroservicePath = (
  microservice: AppTypes.Other.Microservice.MicroServiceName,
) => {
  return '/'.concat(microservice);
};
export const getMicroserviceUrl = (
  microservice: AppTypes.Other.Microservice.MicroServiceName,
) => {
  return SERVER_PREFIX.concat(getMicroservicePath(microservice));
};

export enum RabbitMQExchanges {
  LOCATION_EXCHANGE = 'location-exchange',
  // AUTH_SERVICE_EXCHANGE = 'auth-service-exchange',
}

export const ASSETS_BUCKET_URL =
  'https://meetmap-assets.s3.eu-west-1.amazonaws.com';

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

export const getInvalidEventStartDate = () => {};
export const getMinEventEndDate = () => new Date(Date.now() - ONE_DAY);
