import {
  OperationFacts,
  OperationFact,
  isFactVariant,
  FactVariants,
  OpenAPIV3,
  SpecFactsIterable,
} from '../specs';
import { Option, Some, None, Result, Ok, Err } from 'ts-results';
import invariant from 'ts-invariant';
import equals from 'fast-deep-equal';
import Url from 'url';
import Path from 'path';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export class OperationQueries {
  static fromFacts(facts: SpecFactsIterable): OperationQueries {
    const operations: Array<{
      pathPattern: string;
      method: OpenAPIV3.HttpMethods;
      specPath: string;
    }> = [];
    let baseUrls: string[] = [];

    for (let fact of facts) {
      if (isFactVariant(fact, FactVariants.Operation)) {
        operations.push({
          pathPattern: fact.value.pathPattern,
          method: fact.value.method as OpenAPIV3.HttpMethods,
          specPath: fact.location.jsonPath,
        });
      } else if (isFactVariant(fact, FactVariants.Specification)) {
        baseUrls = fact.value.servers?.map(({ url }) => url) || [];
      }
    }

    return new OperationQueries(operations, baseUrls);
  }

  private patterns: string[];
  private patternsAsComponents: [string, string[]][];
  private basePaths: string[];

  constructor(
    private operations: Array<{
      pathPattern: string;
      method: OpenAPIV3.HttpMethods;
      specPath: string;
    }>,
    baseUrls: string[] = []
  ) {
    this.basePaths =
      baseUrls.length > 0
        ? baseUrls.map((url) => {
            // add absolute in case url is relative (valid in OpenAPI, ignored when absolute)
            const parsed = new Url.URL(url, 'https://example.org');

            return parsed.pathname;
          })
        : ['/'];

    this.patterns = [
      ...new Set(
        this.basePaths.flatMap((basePath) => {
          return this.operations.map(({ pathPattern }) =>
            Path.join(basePath, pathPattern)
          );
        })
      ),
    ];
    this.patternsAsComponents = this.patterns.map((pattern) => [
      pattern,
      fragmentize(pattern),
    ]);
  }

  findOperation(
    path: string,
    method: OpenAPIV3.HttpMethods
  ): Result<
    Option<{
      pathPattern: string;
      method: OpenAPIV3.HttpMethods;
      specPath: string;
    }>,
    string
  > {
    invariant(
      path.startsWith('/'),
      'operation specPath for can not be found for paths with host and / or protocol'
    );

    const matchedPatternResult = this.findPathPattern(path);
    if (matchedPatternResult.err) return matchedPatternResult;

    let maybeMatchedPattern = matchedPatternResult.unwrap();
    if (maybeMatchedPattern.none) return Ok(None);
    let matchedPattern = maybeMatchedPattern.unwrap();

    const operation = this.operations.find((op) =>
      this.basePaths.some(
        (basePath) =>
          Path.join(basePath, op.pathPattern) == matchedPattern &&
          op.method == method
      )
    );

    if (!operation) return Ok(None);

    return Ok(Some(operation));
  }

  findPathPattern(path: string): Result<Option<string>, string> {
    const componentizedPath = fragmentize(path);

    // start with all patterns that match by length
    let qualifiedPatterns = this.patternsAsComponents.filter(
      ([, patternComponents]) =>
        patternComponents.length === componentizedPath.length
    );

    // reduce qualified patterns by comparing component by component
    componentizedPath.forEach((pathComponent, componentIndex) => {
      qualifiedPatterns = qualifiedPatterns.filter(([, patternComponents]) => {
        const patternComponent = patternComponents[componentIndex];
        return (
          pathComponent === patternComponent ||
          isParameterTemplate(patternComponent)
        );
      });
    });

    if (qualifiedPatterns.length > 1) {
      const exactMatch = qualifiedPatterns.find(([, patternComponents]) =>
        equals(patternComponents, componentizedPath)
      );

      if (exactMatch) {
        let [pattern] = exactMatch;
        return Ok(Some(pattern));
      } else {
        return Err('Path matched multiple operations');
      }
    } else if (qualifiedPatterns.length === 1) {
      let [pattern] = qualifiedPatterns[0];
      return Ok(Some(pattern));
    } else {
      return Ok(None);
    }
  }
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

function decodePathFragment(pathFragment: string) {
  try {
    return pathFragment && decodeURIComponent(pathFragment);
  } catch (_) {
    return pathFragment;
  }
}

function isParameterTemplate(pathFragment: string) {
  return /{(.+)}/.test(pathFragment);
}
