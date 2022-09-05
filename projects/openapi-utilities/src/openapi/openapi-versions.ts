import semver from 'semver';

export type SupportedOpenAPIVersions = '3.1.x' | '3.0.x' | '2.0.x';

export function checkOpenAPIVersion(spec: any): SupportedOpenAPIVersions {
  if (typeof spec['swagger'] === 'string') {
    const version = semver.coerce(spec['swagger'])
    // coerce is used here because there is a practice of excluding the patch version in swagger
    if (version && semver.satisfies(version, '2.0')) return '2.0.x';
  }
  if (spec['openapi']) {
    if (semver.satisfies(spec['openapi'], '3.1.x')) return '3.1.x';
    if (semver.satisfies(spec['openapi'], '3.0.x')) return '3.0.x';
  }

  throw new Error(
    `Unsupported OpenAPI version ${
      spec['openapi'] || spec['swagger'] || 'undefined'
    }. Optic supports OpenAPI 3.1.x 3.0.x 2.0`
  );
}
