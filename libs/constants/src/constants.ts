export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9]{6,}$/;
export const MIN_AGE = 12;
export const MAX_AGE = 120;
export const RADIANS_PER_KILOMETER = 1 / 6371.01;

export enum RabbitMQExchanges {
  LOCATION_EXCHANGE = 'location-exchange',
  // AUTH_SERVICE_EXCHANGE = 'auth-service-exchange',
}
