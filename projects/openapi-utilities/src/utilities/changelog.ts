import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { HttpMethods } from '../flat-openapi-types';
import type { ObjectDiff } from '../diff/diff';

export type EndpointChange = {
  method: string;
  path: string;
  changes: Set<string>;
};

const getChangeType = (diff: ObjectDiff) => {
  return diff.after && diff.before
    ? 'changed'
    : diff.after
    ? 'added'
    : 'removed';
};

const isPathChange = (segments: string[]) => segments[0] === 'paths';

const isPathExactChange = (segments: string[]) =>
  isPathChange(segments) && segments.length === 2;

const isMethodChange = (segments: string[]) =>
  isPathChange(segments) &&
  segments.length >= 3 &&
  segments[2].toUpperCase() in HttpMethods;

const isMethodExactChange = (segments: string[]) =>
  isMethodChange(segments) && segments.length === 3;

const isRequestChange = (segments: string[]) =>
  isMethodChange(segments) && segments[3] === 'requestBody';

const isResponseChange = (segments: string[]) =>
  isMethodChange(segments) && segments[3] === 'responses';

const isResponseContentChange = (segments: string[]) =>
  isResponseChange(segments) && segments[5] === 'content';

const isMethodParameterChange = (segments: string[]) =>
  isMethodChange(segments) && segments[3] === 'parameters';

const getParameterValue = (segements: string[], spec: OpenAPIV3.Document) => {
  return jsonPointerHelpers.get(spec, segements);
};

const isExampleChange = (segments: string[]) =>
  segments.some(
    (s, ix) =>
      (s === 'example' || s === 'examples') &&
      (segments[ix - 1] === 'items' ||
        segments[ix - 1] === 'components' ||
        segments[ix - 1] === 'schemas' ||
        segments[ix - 1] === 'schema' ||
        segments[ix - 2] === 'content' ||
        segments[ix - 2] === 'schemas' ||
        segments[ix - 2] === 'properties')
  );

export function getEndpointsChanges(
  baseSpec: OpenAPIV3.Document,
  headSpec: OpenAPIV3.Document,
  diffs: ObjectDiff[]
) {
  const paths = new Map<string, Map<string, Set<string>>>();

  const getChangeDescription = (
    segments: string[],
    spec: any,
    fullSegments: string[],
    changeType: string
  ) => {
    let outPaths = segments.filter(
      (s) => ['schema', 'properties', 'content', 'paths'].indexOf(s) < 0
    );
    if (
      outPaths[outPaths.length - 2] === 'required' &&
      !isNaN(Number(outPaths[outPaths.length - 1]))
    ) {
      const requiredProperty = jsonPointerHelpers.get(spec, fullSegments);
      const label =
        changeType === 'added' ? 'is now required' : 'is not required anymore';

      return (
        outPaths
          .slice(0, -2)
          .concat(requiredProperty)
          .map((s) => `\`${s}\``)
          .join('.') + ` ${label}`
      );
    } else if (
      outPaths[outPaths.length - 2] === 'enum' &&
      !isNaN(Number(outPaths[outPaths.length - 1]))
    ) {
      const enumValue = jsonPointerHelpers.get(spec, fullSegments);
      const path = outPaths
        .slice(0, -2)
        .map((s) => `\`${s}\``)
        .join('.');

      return changeType === 'added'
        ? `added support for new value \`${enumValue}\` on enum ${path}`
        : `removed support for value \`${enumValue}\` from enum ${path}`;
    } else {
      const isProperty = segments[segments.length - 2] === 'properties';
      const path = outPaths.map((s) => `\`${s}\``).join('.');
      if (isProperty) {
        if (changeType === 'added' || changeType === 'removed') {
          return `${changeType} support for ${path} property`;
        } else return `changed ${path} property`;
      } else {
        return `${changeType} ${outPaths.map((s) => `\`${s}\``).join('.')}`;
      }
    }
  };

  const getParameterChange = (
    segments: string[],
    changeType: string,
    spec: any
  ) => {
    const param = getParameterValue(
      segments.slice(0, 5),
      changeType === 'removed' ? baseSpec : headSpec
    );
    return changeType === 'added' || changeType === 'removed'
      ? `${changeType} \`${param?.name}\` ${param?.in} parameter`
      : `\`${param?.name}\` ${param?.in} parameter: ${getChangeDescription(
          segments.slice(5),
          spec,
          segments,
          changeType
        )}`;
  };

  const getRequestBodyChange = (
    segments: string[],
    changeType: string,
    spec: any
  ) => {
    let changeDescription = getChangeDescription(
      segments.slice(6),
      spec,
      segments,
      changeType
    );
    changeDescription = changeDescription ? `: ${changeDescription}` : '';

    return `\`requestBody\`${changeDescription}`;
  };

  const getResponseChange = (
    segments: string[],
    changeType: string,
    spec: any
  ) => {
    if (isResponseContentChange(segments)) {
      let changeDescription = getChangeDescription(
        segments.slice(Math.min(7, segments.length - 1)),
        spec,
        segments,
        changeType
      );
      changeDescription = changeDescription ? `: ${changeDescription}` : '';
      return `\`${segments[4]}\` response${changeDescription}`;
    } else {
      let changeDescription = getChangeDescription(
        segments.slice(5),
        spec,
        segments,
        changeType
      );
      changeDescription = changeDescription ? `: ${changeDescription}` : '';
      return `\`${segments[4]}\` response${changeDescription}`;
    }
  };

  const getChange = (segments: string[], changeType: string, spec: any) => {
    return isRequestChange(segments)
      ? getRequestBodyChange(segments, changeType, spec)
      : isResponseChange(segments)
      ? getResponseChange(segments, changeType, spec)
      : isMethodParameterChange(segments)
      ? getParameterChange(segments, changeType, spec)
      : isMethodExactChange(segments)
      ? `${changeType}`
      : ``;
  };

  for (const diff of diffs) {
    const changeType = getChangeType(diff);
    const segments =
      changeType === 'removed'
        ? jsonPointerHelpers.decode(diff.before!)
        : jsonPointerHelpers.decode(diff.after!);

    if (isPathExactChange(segments)) {
      const path = jsonPointerHelpers.get(
        changeType === 'removed' ? baseSpec : headSpec,
        segments
      );
      const methods: string[] = [];
      for (const method in HttpMethods) {
        if (method.toLowerCase() in path) {
          methods.push(method);
        }
      }
      for (const method of methods) {
        diffs.push({
          ...diff,
          ...(diff.before ? { before: diff.before + `/${method}` } : {}),
          ...(diff.after ? { after: diff.after + `/${method}` } : {}),
        } as any);
      }
      continue;
    }

    if (!isMethodChange(segments)) continue;
    if (isExampleChange(segments)) continue;

    const [, path, method] = segments;

    if (!paths.get(path)) paths.set(path, new Map());
    const prevPath = paths.get(path)!;
    const prevMethod = prevPath.get(method) ?? new Set();

    const spec = changeType === 'removed' ? baseSpec : headSpec;
    const change = getChange(segments, changeType, spec);

    if (change) prevMethod.add(change);
    prevPath.set(method, prevMethod);
  }

  const endpointChanges: EndpointChange[] = [];

  for (const [path, methods] of paths.entries()) {
    for (const [method, changes] of methods.entries()) {
      if (!changes.size) continue;
      endpointChanges.push({
        method,
        path,
        changes,
      });
    }
  }

  return endpointChanges;
}
