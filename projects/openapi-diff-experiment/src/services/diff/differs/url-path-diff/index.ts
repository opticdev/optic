import { OpenAPIDiffingQuestions } from '../../../read/types';
import {
  DiffResult,
  DiffType,
  EitherDiffResult,
  UnmatchedPath,
} from '../../types';
import invariant from 'ts-invariant';
import equals from 'fast-deep-equal';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export type MatchedUrlPath = {
  path: string;
  urlPath: string;
  pathParameterValues: { [key: string]: string };
};

export function urlPathDiffFromSpec(openapiQuestions: OpenAPIDiffingQuestions) {
  return urlPathDiff(openapiQuestions.paths());
}

export function urlPathDiff(paths: string[]) {
  const allPathsAsFragments: [string, string[]][] = paths.map((value) => [
    value,
    fragmentize(value),
  ]);

  const allPaths: string[][] = allPathsAsFragments.map((i) => i[1]);

  function compare(
    method: OpenAPIV3.HttpMethods,
    urlPath: string
  ): EitherDiffResult<MatchedUrlPath> {
    invariant(
      urlPath.startsWith('/'),
      'paths can not be matched to OpenAPI unless the protocol and host have been removed'
    );

    const inputAsFragment = fragmentize(urlPath);

    /*
      Introduces a valid assumption
      - when we lookup a corresponding index in urlPath, it will always be present
     */

    const pathParameterValues: { [key: string]: string } = {};

    let qualifiedPaths = allPaths.filter(
      (i) => i.length === inputAsFragment.length
    );

    let closestMatch: string[] = [];

    inputAsFragment.forEach((item, index) => {
      const filtered = qualifiedPaths.filter((otherPath) => {
        const otherPathComponent = otherPath[index];
        if (otherPathComponent === item) {
          return true;
        } else if (isTemplated(otherPathComponent)) {
          // remove leading { and trailing }
          const pathParameterName = stripParamBrackets(otherPathComponent);
          // set to the corresponding component from our input
          pathParameterValues[pathParameterName] = item;
          return true;
        } else {
          return false;
        }
      });
      // grab the last one before overwriting
      if (qualifiedPaths.length > 0 && filtered.length === 0) {
        if (index === 0) {
          closestMatch = inputAsFragment;
        } else {
          closestMatch = qualifiedPaths[0];
        }
      }
      qualifiedPaths = filtered;
    });

    if (qualifiedPaths.length > 1) {
      const exactMatch = qualifiedPaths.find((i) => equals(i, inputAsFragment));

      if (exactMatch) {
        const matchPath: string = allPathsAsFragments.find((i) =>
          equals(i[1], exactMatch)
        )![0];
        return DiffResult.matchWithContext<MatchedUrlPath>({
          pathParameterValues: {},
          urlPath,
          path: matchPath,
        });
      }

      return DiffResult.error(`Url matched > 1 path ${urlPath} `);
    } else if (qualifiedPaths.length === 1) {
      const match = qualifiedPaths[0];
      const matchPath: string = allPathsAsFragments.find((i) =>
        equals(i[1], match)
      )![0];

      // strip any other path's params matched along the way
      const toDelete = Object.keys(pathParameterValues).filter((paramKey) => {
        const includeInParams = match.some(
          (i) => isTemplated(i) && stripParamBrackets(i) === paramKey
        );
        return !includeInParams;
      });
      toDelete.forEach((i) => delete pathParameterValues[i]);

      return DiffResult.matchWithContext<MatchedUrlPath>({
        pathParameterValues: pathParameterValues,
        urlPath,
        path: matchPath,
      });
    } else {
      const closestPath: string = '';

      const close = (() => {
        if (closestMatch.length === 0) return urlPath;
        return (
          '/' +
          [
            ...closestMatch.slice(0, closestMatch.length - 1),
            ...inputAsFragment.slice(closestMatch.length - 1),
          ].join('/')
        );
      })();

      return DiffResult.diff([
        {
          type: DiffType.UnmatchedPath,
          path: urlPath,
          method,
          closestMatch: close,
        },
      ]);
    }
  }

  return {
    compareToPath: (
      method: OpenAPIV3.HttpMethods,
      urlPath: string
    ): EitherDiffResult<MatchedUrlPath> => {
      try {
        return compare(method, urlPath);
      } catch (e: any) {
        return DiffResult.error(e.message!);
      }
    },
  };
}

/*
  Copied from https://github.com/stoplightio/prism/blob/0ad49235879ad4f7fcafa7b5badcb763b0c37a6a/packages/http/src/router/matchPath.ts
  under https://github.com/stoplightio/prism/blob/master/LICENSE
 */
export function fragmentize(path: string): string[] {
  if (path.length === 0 || !path.startsWith('/')) {
    throw new Error(`Malformed path '${path}'`);
  }
  return path.split('/').slice(1).map(decodePathFragment);
}

export function pathParameterNamesForPathPattern(
  pathPattern: string
): string[] {
  return fragmentize(pathPattern).filter(isTemplated).map(stripParamBrackets);
}

function isTemplated(pathFragment: string) {
  return /{(.+)}/.test(pathFragment);
}

function decodePathFragment(pathFragment: string) {
  try {
    return pathFragment && decodeURIComponent(pathFragment);
  } catch (_) {
    return pathFragment;
  }
}

function stripParamBrackets(input: string): string {
  invariant(input.startsWith('{'), 'must start with {');
  invariant(input.endsWith('}'), 'must end with }');
  return input.substring(1, input.length - 1);
}
