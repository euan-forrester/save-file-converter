import axios from 'axios';
import axiosRetry from 'axios-retry';

const NUM_RETRIES = 3; // Definitely need some retries given that we're dealing with a free proxy and a free website (that's not intended to be an API)
const RETRY_DELAY = 500; // ms

export default function getHttpClient(baseUrl) {
  const client = axios.create({
    baseURL: baseUrl,
  });

  axiosRetry(client, {
    retries: NUM_RETRIES,
    retryDelay: () => RETRY_DELAY,
  });

  return client;
}
