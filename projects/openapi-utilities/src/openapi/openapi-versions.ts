import semver from 'semver';

export type SupportedOpenAPIVersions = '3.1.x' | '3.0.x' | '2.0.x';

export function checkOpenAPIVersion(spec: {
  openapi?: string;
  swagger: string;
}): SupportedOpenAPIVersions {
  // if (spec.swagger) {
  //   if (semver.satisfies(spec.swagger, '2.0.x')) return '2.0.x';
  // }
  if (spec.openapi) {
    if (semver.satisfies(spec.openapi, '3.1.x')) return '3.1.x';
    if (semver.satisfies(spec.openapi, '3.0.x')) return '3.0.x';
  }
  throw new Error(
    `Unsupported OpenAPI version ${
      spec.openapi || spec.swagger || 'undefined'
    }. Optic supports OpenAPI 3.1.x 3.0.x`
    // }. Optic supports OpenAPI 3.1.x 3.0.x 2.0`
  );
}
