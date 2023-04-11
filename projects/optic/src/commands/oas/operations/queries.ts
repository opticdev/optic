import {
  FactVariants,
  isFactVariant,
  OpenAPIV3,
  SpecFactsIterable,
} from '../specs';
import { Err, None, Ok, Option, Result, Some } from 'ts-results';
import invariant from 'ts-invariant';
import equals from 'fast-deep-equal';
import Url from 'url';

import { PathComponentKind, PathComponents } from '.';
import UrlJoin from 'url-join';

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
  private patternsAsComponents: [string, PathComponents][];
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
            const pathName = parsed.pathname;
            if (pathName.endsWith('/') && pathName.length > 1) {
              return pathName.substring(0, pathName.length - 1);
            } else {
              return pathName;
            }
          })
        : ['/'];

    this.patterns = [
      ...new Set(
        this.basePaths.flatMap((basePath) => {
          return this.operations.map(({ pathPattern }) =>
            UrlJoin(basePath, pathPattern)
          );
        })
      ),
    ];

    this.patternsAsComponents = this.patterns.map((pattern) => [
      pattern,
      PathComponents.fromPath(pattern),
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

    const matchedPatternResult = this.matchPathPattern(path);
    if (matchedPatternResult.err) return matchedPatternResult;

    let maybeMatchedPattern = matchedPatternResult.unwrap();
    if (maybeMatchedPattern.none) return Ok(None);
    let matchedPattern = maybeMatchedPattern.unwrap();

    const operation = this.operations.find((op) =>
      this.basePaths.some(
        (basePath) =>
          UrlJoin(basePath, op.pathPattern) == matchedPattern &&
          op.method == method
      )
    );

    if (!operation) return Ok(None);

    return Ok(Some(operation));
  }

  findPathPattern(pathPattern: string): Result<Option<string>, string> {
    invariant(
      pathPattern.startsWith('/'),
      'path pattern for can not be found for paths with host and / or protocol'
    );

    // path patterns are assumed not have base paths included, but the matcher _does_
    if (this.basePaths.length > 0) {
      pathPattern = UrlJoin(this.basePaths[0], pathPattern);
    }

    const matchedPatternResult = this.matchPathPattern(pathPattern);
    if (matchedPatternResult.err) return matchedPatternResult;

    let maybeMatchedPattern = matchedPatternResult.unwrap();
    if (maybeMatchedPattern.none) return Ok(None);
    let matchedPattern = maybeMatchedPattern.unwrap();

    const operation = this.operations.find((op) =>
      this.basePaths.some(
        (basePath) => UrlJoin(basePath, op.pathPattern) == matchedPattern
      )
    );

    if (!operation) return Ok(None);

    return Ok(Some(operation.pathPattern));
  }

  matchPathPattern(path: string): Result<Option<string>, string> {
    const componentizedPath = PathComponents.fromPath(path);

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
          pathComponent.name === patternComponent.name ||
          patternComponent.kind === PathComponentKind.Template
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
        return Ok(Some(qualifiedPatterns[0][0]));
      }
    } else if (qualifiedPatterns.length === 1) {
      let [pattern] = qualifiedPatterns[0];
      return Ok(Some(pattern));
    } else {
      return Ok(None);
    }
  }
}

export function specToOperations(spec: OpenAPIV3.Document) {
  const operations: { pathPattern: string; methods: string[] }[] = [];

  const allowedKeys = [
    'get',
    'post',
    'put',
    'delete',
    'patch',
    'head',
    'options',
  ];
  Object.entries(spec.paths).forEach(([pathPattern, methods]) => {
    if (methods) {
      operations.push({
        pathPattern,
        methods: Object.keys(methods).filter((key) =>
          allowedKeys.includes(key)
        ),
      });
    }
  });

  return operations;
}
