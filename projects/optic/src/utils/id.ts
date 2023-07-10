export const getEndpointId = (endpoint: {
  method: string;
  path: string;
}): string => {
  return `${endpoint.method.toUpperCase()} ${endpoint.path.toLowerCase()}`;
};
