import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OPTIC_PATH_IGNORE_KEY } from '../../../../constants';
import { Operation } from 'fast-json-patch';

import { PatchImpact } from '../../../oas/patches';
import { SpecPatch } from '../../../oas/specs';

export function getIgnorePathPatch(
  spec: OpenAPIV3.Document,
  ignorePaths: (string | { method: string; path: string })[]
): SpecPatch {
  const hasExistingIgnorePaths = Array.isArray(spec[OPTIC_PATH_IGNORE_KEY]);
  const operations: Operation[] = [];
  const basePath = jsonPointerHelpers.compile([OPTIC_PATH_IGNORE_KEY]);

  if (!hasExistingIgnorePaths) {
    operations.push({
      op: 'replace',
      path: basePath,
      value: [],
    });
  }

  for (const path of ignorePaths) {
    operations.push({
      op: 'add',
      path: jsonPointerHelpers.compile([OPTIC_PATH_IGNORE_KEY, '-']),
      value: path,
    });
  }

  return {
    description: 'add x-optic-path-ignore values',
    diff: undefined,
    impact: [PatchImpact.Addition],
    groupedOperations: [
      {
        intent: 'add ignore paths to optic',
        operations,
      },
    ],
    path: basePath,
  };
}
