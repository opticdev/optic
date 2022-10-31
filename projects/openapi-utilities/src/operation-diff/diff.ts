import { OpenAPIOperation } from './normalize-operation';
import { OpenApiKind } from '../openapi3/sdk/types';
import { diffCollectionByComputedIndex } from './diff-collection-by-computed-index';
import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function diff(
  before: OpenAPIOperation,
  after: OpenAPIOperation
): OperationDiffResult[] {
  const differ = new OperationDiff(before, after);
  return differ.diff();
}

class OperationDiff {
  constructor(
    private before: OpenAPIOperation,
    private after: OpenAPIOperation
  ) {}

  private results: OperationDiffResult[] = [];

  diff() {
    this.results = [];
    this.diffParameters();
    return this.results;
  }

  private emitAdded(kind: OpenApiKind, apiId: string, jsonPath: string) {
    this.results.push({
      diff: 'node-added',
      kind,
      coordinates: {
        jsonPath,
        apiId,
      },
    });
  }
  private emitRemoved(kind: OpenApiKind, apiId: string, jsonPath: string) {
    this.results.push({
      diff: 'node-removed',
      kind,
      coordinates: {
        jsonPath,
        apiId,
      },
    });
  }
  private emitUpdated(
    kind: OpenApiKind,
    apiId: string,
    jsonPath: string,
    change: { attribute: string; before: any; after: any }
  ) {
    this.results.push({
      diff: 'node-updated',
      kind,
      coordinates: {
        jsonPath,
        apiId,
      },
      ...change,
    });
  }

  ////

  diffParameters() {
    const parameterDiff =
      diffCollectionByComputedIndex<OpenAPIV3.ParameterObject>(
        (param) => {
          return `${param.in}/${param.name}`;
        },
        (this.before.operation.parameters || []) as OpenAPIV3.ParameterObject[],
        (this.after.operation.parameters || []) as OpenAPIV3.ParameterObject[]
      );

    const inToKind = (inValue: OpenAPIV3.ParameterObject['in']) => {
      if (inValue === 'query') return OpenApiKind.QueryParameter;
      if (inValue === 'path') return OpenApiKind.PathParameter;
      if (inValue === 'header') return OpenApiKind.HeaderParameter;
      if (inValue === 'cookie') return OpenApiKind.CookieParameter;
      throw new Error(`${inValue} parameter invalid`);
    };

    parameterDiff.addedNodes().forEach(([id, node]) => {
      this.emitAdded(
        inToKind(node.in),
        id,
        jsonPointerHelpers.append(
          this.after.coordinates.absoluteJsonPath,
          'parameters',
          (this.after.operation.parameters || []).indexOf(node).toString()
        )
      );
    });

    parameterDiff.removedNodes().forEach(([id, node]) => {
      this.emitRemoved(
        inToKind(node.in),
        id,
        jsonPointerHelpers.append(
          this.before.coordinates.absoluteJsonPath,
          'parameters',
          (this.before.operation.parameters || []).indexOf(node).toString()
        )
      );
    });

    parameterDiff.continuousNodes().forEach(([id, before, after]) => {
      diffAttributes(before, after, ['name', 'in', 'schema']).forEach(
        (nodeUpdate) => {
          this.emitUpdated(
            inToKind(before.in), //
            id,
            jsonPointerHelpers.append(
              this.after.coordinates.absoluteJsonPath,
              'parameters',
              (this.after.operation.parameters || []).indexOf(after).toString(),
              nodeUpdate.attribute
            ),
            nodeUpdate
          );

          // @todo visit the schema
        }
      );
    });
  }

  visitParameter() {}

  diffResponses() {}
  visitResponse() {}

  diffRequests() {}
  visitRequest() {}

  visitSchema() {}
}

function diffAttributes(before: object, after: object, exclude: string[]) {
  const attributeDiff = diffCollectionByComputedIndex<[string, any]>(
    ([key]) => {
      return key;
    },
    Object.entries(before).filter(([key]) => !exclude.includes(key)),
    Object.entries(after).filter(([key]) => !exclude.includes(key))
  );

  const results: { attribute: string; before: any; after: any }[] = [];

  attributeDiff.addedNodes().forEach(([id, addedValue]) => {
    results.push({ attribute: id, before: undefined, after: addedValue[1] });
  });

  attributeDiff.removedNodes().forEach(([id, removedValue]) => {
    results.push({ attribute: id, before: removedValue[1], after: undefined });
  });

  attributeDiff.continuousNodes().forEach(([id, before, after]) => {
    results.push({ attribute: id, before: before[1], after: after[1] });
  });

  return results;
}

type OperationDiffResult = {
  kind: OpenApiKind;
  coordinates: {
    apiId: string;
    jsonPath: string;
  };
} & (
  | {
      diff: 'node-added';
    }
  | {
      diff: 'node-removed';
    }
  | { diff: 'node-updated'; attribute: string; before: any; after: any }
);
