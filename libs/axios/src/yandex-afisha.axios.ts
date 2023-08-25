import axios from 'axios';

export const yandexAfishaAxios = axios.create({
  baseURL: 'https://afisha.yandex.ru/api',
});
