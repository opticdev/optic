// This should not be changed as the ID is used in the URLs
export const getOperationId = (operation: {
  pathPattern: string;
  method: string;
}) => `${operation.method}.${operation.pathPattern}`;

export const parseOperationId = (operationId: string) => {
  const [method, ...pathSegments] = operationId.split('.');
  return { method, path: pathSegments.join('.') };
};
