import urljoin from 'url-join';

const apiPathPrefix = '/api/v1';
const apiBaseUrl = urljoin(
  process.env.OPTIC_LOCAL_CLI__API_GATEWAY || 'https://api.opticnerve.net',
  apiPathPrefix
);
const Config = {
  apiBaseUrl,
  hiddenFeatures: ['testing'],
};
export default Config;
export { Config };
