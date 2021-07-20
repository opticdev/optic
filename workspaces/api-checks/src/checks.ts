import { CheckFunction } from './types';

export const requireNotFoundWithGet: CheckFunction = async ({ endpoint }) => {
  if (!isMethod(endpoint, 'GET')) return;
  return requireStatusCode(endpoint, 404);
};

export function isMethod(endpoint: any, method: string) {
  return endpoint.method === method;
}

export function hasStatusCode(endpoint: any, givenStatusCode: number) {
  return Boolean(
    endpoint.responses.find(({ statusCode }: { statusCode: number }) => {
      return statusCode === givenStatusCode;
    })
  );
}

export function requireStatusCode(endpoint: any, statusCode: number) {
  if (!hasStatusCode(endpoint, statusCode)) {
    return `Endpoint ${endpoint.absolutePathPatternWithParameterNames} ${endpoint.method} does not have a ${statusCode} status code`;
  }
}
