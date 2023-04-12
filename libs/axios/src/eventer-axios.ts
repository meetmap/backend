import axios from 'axios';
import * as https from 'https';
export const eventerAxios = axios.create({
  //   httpsAgent: new https.Agent({ keepAlive: false }),
});
