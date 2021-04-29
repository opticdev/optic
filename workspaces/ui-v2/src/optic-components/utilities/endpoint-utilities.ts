export function getEndpointId(endpoint: { pathId: string, method: string }) {
  const {pathId, method} = endpoint;
  return `${pathId}.${method.toUpperCase()}`
}