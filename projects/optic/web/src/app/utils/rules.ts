import type { RuleResult } from '@useoptic/openapi-utilities';
import type { InternalSpec } from './types';
import { getDiffSegments, setInResult } from './changelog-tree';
import { ojp } from './utils';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { objectWithRemovedItems } from './all-items';

type PathTree = Record<string, { specPath: string | null; children: PathTree }>;

function buildPaths(
  obj: any,
  path: string,
  map: PathTree,
  withRemoved: boolean
) {
  if (!obj) {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((v, i) => {
      buildPaths(
        v,
        jsonPointerHelpers.append(path, String(i)),
        map,
        withRemoved
      );
    });
  } else if (typeof obj === 'object') {
    if (obj[ojp]) {
      const parts = jsonPointerHelpers.decode(obj[ojp]);
      let cur = map;
      for (const part of parts.slice(0, -1)) {
        if (!cur[part]) {
          cur[part] = {
            specPath: null,
            children: {},
          };
        }
        cur = cur[part].children;
      }
      const last = parts[parts.length - 1];
      if (cur[last]) {
        cur[last].specPath = path;
      } else {
        cur[last] = {
          specPath: path,
          children: {},
        };
      }
    }
    const allObj = withRemoved ? objectWithRemovedItems(obj) : obj;

    for (const [key, value] of Object.entries(allObj)) {
      buildPaths(value, jsonPointerHelpers.append(path, key), map, withRemoved);
    }
  }
}

export function attachRuleResults(
  spec: InternalSpec,
  results: RuleResult[]
): InternalSpec {
  const pathMap: PathTree = {};
  buildPaths(spec, '', pathMap, false);
  const withRemovedPathMap: PathTree = {};
  buildPaths(spec, '', withRemovedPathMap, true);

  for (const result of results) {
    if (result.passed || result.exempted) continue;

    let specPath = jsonPointerHelpers.compile(['metadata']);
    let current: PathTree =
      result.location.spec === 'after' ? pathMap : withRemovedPathMap;
    for (const part of jsonPointerHelpers.decode(result.location.jsonPath)) {
      const child = current[part];
      if (child) {
        if (child.specPath !== null) {
          specPath = child.specPath;
        }
        current = child.children;
      } else {
        break;
      }
    }
    // TODO fix this to apply to multiple paths in internal spec (e.g. we might render a single json path to multiple locations)
    setInResult(spec, jsonPointerHelpers.decode(specPath), result);
  }

  return spec;
}

export const addOpticResultsToOriginal = <T extends object>(
  after: T,
  results: RuleResult[]
) => {
  for (const result of results) {
    if (result.passed || result.exempted) continue;
    const pathSegments = getDiffSegments(result.location.jsonPath);
    setInResult(after, pathSegments, result);
  }

  return after;
};
