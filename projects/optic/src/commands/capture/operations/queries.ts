import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { None, Ok, Option, Result, Some } from 'ts-results';
import { matchPathPattern } from '../../../utils/pathPatterns';

export class OperationQueries {
  private patterns: string[];

  constructor(
    private operations: Array<{
      pathPattern: string;
      method: string;
    }>
  ) {
    this.patterns = [
      ...new Set(this.operations.map(({ pathPattern }) => pathPattern)),
    ];
  }

  findOperation(
    path: string,
    method: string
  ): Result<
    Option<{
      pathPattern: string;
      method: string;
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
    let qualifiedPatterns = this.patterns.filter(
      (pattern) => matchPathPattern(pattern, path).match
    );

    if (qualifiedPatterns.length > 1) {
      const exactMatch = qualifiedPatterns.find((pattern) => {
        const match = matchPathPattern(pattern, path);
        return match.match && match.exact;
      });

      if (exactMatch) {
        return Ok(Some(exactMatch));
      } else {
        return Ok(Some(qualifiedPatterns[0]));
      }
    } else if (qualifiedPatterns.length === 1) {
      let pattern = qualifiedPatterns[0];
      return Ok(Some(pattern));
    } else {
      return Ok(None);
    }
  }
}

export function specToOperations(spec: OpenAPIV3.Document) {
  return specToPaths(spec).flatMap((o) =>
    o.methods.map((m) => ({ method: m, pathPattern: o.pathPattern }))
  );
}

export function specToPaths(spec: OpenAPIV3.Document) {
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
