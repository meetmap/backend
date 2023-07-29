import { AppTypes } from '@app/types';

export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9]{6,}$/;
export const MIN_AGE = 12;
export const MAX_AGE = 120;
export const RADIANS_PER_KILOMETER = 1 / 6371.01;

export const SERVER_PREFIX = 'https://api.meetmap.xyz';

export const CORS_ORIGINS = /\\*\.meetmap.xyz|localhost/;

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
