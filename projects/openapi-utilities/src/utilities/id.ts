const ENDPOINT_ID_SEPARATOR = '-~_~-';
export const getEndpointId = (endpoint: {
  method: string;
  path: string;
}): string => {
  return `${endpoint.method.toUpperCase()}${ENDPOINT_ID_SEPARATOR}${
    endpoint.path
  }`;
};
