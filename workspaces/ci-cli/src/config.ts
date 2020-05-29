import urljoin from 'url-join';

const apiPathPrefix = '/api/v1';
const apiBaseUrl = urljoin(
  process.env.OPTIC_LOCAL_CLI__API_GATEWAY ||
    'https://k2shife0j5.execute-api.us-east-1.amazonaws.com/stage',
  apiPathPrefix
);
const Config = {
  apiBaseUrl,
};
export default Config;
export { Config };
