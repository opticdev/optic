import semver from 'semver';
import { ValidationError } from './errors';

export type SupportedOpenAPIVersions = '3.1.x' | '3.0.x';

export function checkOpenAPIVersion(spec: {
  openapi: string;
}): SupportedOpenAPIVersions {
  if (semver.satisfies(spec.openapi, '3.1.x')) return '3.1.x';
  if (semver.satisfies(spec.openapi, '3.0.x')) return '3.0.x';
  throw new ValidationError(
    `Unsupported OpenAPI version ${spec.openapi}. Optic supports OpenAPI 3.1.x and 3.0.x`
  );
}
