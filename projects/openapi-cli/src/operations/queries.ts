import { OperationFacts, OperationFact, OpenAPIV3 } from '../specs';
import { Option, Some, None, Result, Ok, Err } from 'ts-results';
import invariant from 'ts-invariant';
import equals from 'fast-deep-equal';

class OperationQueries {
  static async fromFacts(facts: OperationFacts): Promise<OperationQueries> {
    const operations: Array<{
      pathPattern: string;
      method: OpenAPIV3.HttpMethods;
      specPath: string;
    }> = [];
    for await (let fact of facts) {
      operations.push({
        pathPattern: fact.value.pathPattern,
        method: fact.value.method as OpenAPIV3.HttpMethods,
        specPath: fact.location.jsonPath,
      });
    }

    return new OperationQueries(operations);
  }

  patterns: string[];
  patternsAsComponents: string[][];

  constructor(
    private operations: Array<{
      pathPattern: string;
      method: OpenAPIV3.HttpMethods;
      specPath: string;
    }>
  ) {
    this.patterns = operations.map(({ pathPattern }) => pathPattern);
    this.patternsAsComponents = this.patterns.map((pattern) =>
      fragmentize(pattern)
    );
  }

  findSpecPath(
    path: string,
    method: OpenAPIV3.HttpMethods
  ): Result<Option<string>, string> {
    invariant(
      path.startsWith('/'),
      'operation specPath for can not be found for paths with host and / or protocol'
    );

    const componentizedPath = fragmentize(path);

    // start with all patterns that match by length
    let qualifiedPatterns = this.patternsAsComponents.filter(
      (path) => path.length === componentizedPath.length
    );

    // reduce qualified patterns by comparing component by component
    componentizedPath.forEach((pathComponent, componentIndex) => {
      qualifiedPatterns = qualifiedPatterns.filter((pattern) => {
        const patternComponent = pattern[componentIndex];
        return (
          pathComponent === patternComponent ||
          isParameterTemplate(patternComponent)
        );
      });
    });

    if (qualifiedPatterns.length > 1) {
      const exactMatch = qualifiedPatterns.find((pattern) =>
        equals(pattern, componentizedPath)
      );

      if (exactMatch) {
        // TODO: look up spec path an return
      }

      return Err('Path matched multiple operations');
    } else if (qualifiedPatterns.length === 1) {
      return Ok(None); // TODO: return matched spec path
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
