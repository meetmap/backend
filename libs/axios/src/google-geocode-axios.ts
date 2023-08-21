import axios from 'axios';

export const googleGeocodeAxios = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api/geocode/json',
});
