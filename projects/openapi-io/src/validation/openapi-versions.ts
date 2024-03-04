import semver from 'semver';
import { OpenAPIVersionError } from './errors';

export type SupportedOpenAPIVersions = '3.1.x' | '3.0.x' | '2.x.x';

export function checkOpenAPIVersion(spec: {
  openapi?: string;
  swagger?: string;
}): SupportedOpenAPIVersions {
  if (spec.openapi && semver.satisfies(spec.openapi, '3.1.x')) return '3.1.x';
  if (spec.openapi && semver.satisfies(spec.openapi, '3.0.x')) return '3.0.x';
  if (spec.swagger && semver.satisfies(spec.swagger, '2.x.x')) return '2.x.x';
  throw new OpenAPIVersionError(
    `Unsupported OpenAPI version ${
      spec.openapi ?? spec.swagger
    }. Optic supports OpenAPI 3.1.x and 3.0.x`,
    spec.openapi ?? spec.swagger
  );
}
