import {
  FactVariants,
  isFactVariant,
  OpenAPIV3,
  SpecFactsIterable,
} from '../specs';
import { None, Ok, Option, Result, Some } from 'ts-results';
import equals from 'fast-deep-equal';

import { PathComponentKind, PathComponents } from '.';

export class OperationQueries {
  static fromFacts(facts: SpecFactsIterable): OperationQueries {
    const operations: Array<{
      pathPattern: string;
      method: string;
      specPath: string;
    }> = [];

    for (let fact of facts) {
      if (isFactVariant(fact, FactVariants.Operation)) {
        operations.push({
          pathPattern: fact.value.pathPattern,
          method: fact.value.method,
          specPath: fact.location.jsonPath,
        });
      }
    }

    return new OperationQueries(operations);
  }

  private patterns: string[];
  private patternsAsComponents: [string, PathComponents][];

  constructor(
    private operations: Array<{
      pathPattern: string;
      method: string;
      specPath: string;
    }>
  ) {
    this.patterns = [
      ...new Set(this.operations.map(({ pathPattern }) => pathPattern)),
    ];
    this.patternsAsComponents = this.patterns.map((pattern) => [
      pattern,
      PathComponents.fromPath(pattern),
    ]);
  }

  findOperation(
    path: string,
    method: string
  ): Result<
    Option<{
      pathPattern: string;
      method: string;
      specPath: string;
    }>,
    string
  > {
    const matchedPatternResult = this.matchPathPattern(path);
    if (matchedPatternResult.err) return matchedPatternResult;
    let maybeMatchedPattern = matchedPatternResult.unwrap();
    if (maybeMatchedPattern.none) return Ok(None);
    let matchedPattern = maybeMatchedPattern.unwrap();

    const operation = this.operations.find(
      (op) =>
        matchedPattern.toLowerCase() === op.pathPattern.toLowerCase() &&
        op.method.toLowerCase() == method.toLowerCase()
    );

    if (!operation) return Ok(None);

    return Ok(Some(operation));
  }

  findPathPattern(pathPattern: string): Result<Option<string>, string> {
    const matchedPatternResult = this.matchPathPattern(pathPattern);
    if (matchedPatternResult.err) return matchedPatternResult;

    let maybeMatchedPattern = matchedPatternResult.unwrap();
    if (maybeMatchedPattern.none) return Ok(None);
    let matchedPattern = maybeMatchedPattern.unwrap();

    const operation = this.operations.find(
      (op) => op.pathPattern === matchedPattern
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
