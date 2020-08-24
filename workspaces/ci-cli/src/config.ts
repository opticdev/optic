import urljoin from 'url-join';

const apiPathPrefix = '/api/v1';
const apiBaseUrl = urljoin(
  process.env.OPTIC_LOCAL_CLI__API_GATEWAY || 'https://api.opticnerve.net',
  apiPathPrefix
);

const specViewerUrl = process.env.OPTIC_LOCAL_SPEC_VIEWER_URL || 'https://apidocs.useoptic.com'

const Config = {
  apiBaseUrl,
  specViewerUrl
};
export default Config;
export { Config };
