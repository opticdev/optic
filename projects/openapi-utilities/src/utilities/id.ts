const ENDPOINT_ID_SEPARATOR = '-~_~-';
export const getPathAndMethodFromEndpointId = (
  endpointId: string
): {
  method: string;
  path: string;
} => {
  const [method, path] = endpointId.split(ENDPOINT_ID_SEPARATOR);
  return { method, path };
};

export const getEndpointId = (endpoint: {
  method: string;
  path: string;
}): string => {
  return `${endpoint.method.toUpperCase()}${ENDPOINT_ID_SEPARATOR}${
    endpoint.path
  }`;
};
