// TODO - this should be made into a common utilities to be used across FE + BE

import * as Swagger2 from './swagger2';
import * as OAS3 from './oas3';
import * as OAS3_1 from './oas3_1';
import type { InternalSpec, InternalSpecEndpoint } from './types';
import { ojp } from './utils';

type SupportedVersions = '2.x.x' | '3.0.x' | '3.1.x';

export * from './all-items';
export * from './changelog-tree';
export * from './utils';
export * from './operationId';
export { attachRuleResults, addOpticResultsToOriginal } from './rules';

export function createEmptySpec(): InternalSpec {
  return {
    metadata: {
      version: '',
      servers: {},
      info: {},
      misc: {},
      [ojp]: '',
    },
    endpoints: {},
  };
}

export function specToInternal(
  spec: any,
  version: SupportedVersions
): InternalSpec {
  if (version === '3.0.x') {
    return OAS3.specToInternal(spec);
  } else if (version === '3.1.x') {
    return OAS3_1.specToInternal(spec);
  } else if (version === '2.x.x') {
    return Swagger2.specToInternal(spec);
  }
  throw new Error(`unimplemented version ${version}`);
}

export function endpointToInternal(
  endpoint: any,
  { path, method }: { path: string; method: string },
  version: SupportedVersions
): InternalSpecEndpoint {
  if (version === '3.0.x') {
    return OAS3.endpointToInternal(endpoint, { path, method });
  } else if (version === '3.1.x') {
    return OAS3_1.endpointToInternal(endpoint, { path, method });
  } else if (version === '2.x.x') {
    return Swagger2.endpointToInternal(endpoint, { path, method });
  }

  throw new Error(`unimplemented version ${version}`);
}

export function specToInternalInferVersion(spec: any): InternalSpec {
  const version = spec.swagger
    ? '2.x.x'
    : spec.openapi?.startsWith('3.0.')
      ? '3.0.x'
      : '3.1.x';

  return specToInternal(spec, version);
}

export { Swagger2, OAS3, OAS3_1 };
export * from './types';
