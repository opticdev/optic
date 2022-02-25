import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { JsonSchemaKnownKeyword } from '..';
import { ShapeDiffResult } from '../result';
import { ErrorObject } from '../traverser';

import { additionalProperties } from './additionalProperties';
import { oneOfKeyword } from './oneOf';
import { requiredKeyword } from './required';
import { typeKeyword } from './type';

export interface ShapeDiffVisitor {
  (
    validationError: ErrorObject,
    example: any
  ): IterableIterator<ShapeDiffResult>;
}

const visitors: ShapeDiffVisitor[] = [
  additionalProperties,
  oneOfKeyword,
  requiredKeyword,
  typeKeyword,
];

export function* diffVisitors(
  validationErrors: Iterable<ErrorObject>,
  example: any
): IterableIterator<ShapeDiffResult> {
  let oneOfs: Map<string, ErrorObject> = new Map();
  let oneOfBranchType: [string, ErrorObject][] = [];
  let oneOfBranchOther: [string, ErrorObject][] = [];

  for (let validationError of validationErrors) {
    if (validationError.keyword === JsonSchemaKnownKeyword.oneOf) {
      let schemaPath = validationError.schemaPath.substring(1); // valid json pointer
      oneOfs.set(schemaPath, validationError);
    } else if (validationError.schemaPath.indexOf('oneOf') > -1) {
      // probably has a oneof ancestor

      let schemaPath = jsonPointerHelpers.decode(
        validationError.schemaPath.substring(1)
      );
      let oneOfPath = schemaPath.slice(0, schemaPath.lastIndexOf('oneOf') + 1);
      let branchPath = schemaPath.slice(oneOfPath.length);

      if (
        branchPath.length == 2 &&
        branchPath[1] === JsonSchemaKnownKeyword.type
      ) {
        oneOfBranchType.push([
          jsonPointerHelpers.compile(oneOfPath),
          validationError,
        ]);
      } else if (branchPath.length >= 2) {
        oneOfBranchOther.push([
          jsonPointerHelpers.compile(oneOfPath),
          validationError,
        ]);
      }
    } else {
      // not related to one-of? visit right away
      for (let visitor of visitors) {
        yield* visitor(validationError, example);
      }
    }
  }

  for (let [oneOfPath, otherBranchError] of oneOfBranchOther) {
    // any nested errors are all safe to visit
    for (let visitor of visitors) {
      yield* visitor(otherBranchError, example);
    }

    // once a nested error has been visited, we consider this a branch type match
    oneOfs.delete(oneOfPath);
    oneOfBranchType = oneOfBranchType.filter(
      ([branchOneOfPath, _]) => oneOfPath !== branchOneOfPath
    );
  }

  // visit any left over one ofs
  for (let oneOfError of oneOfs.values()) {
    for (let visitor of visitors) {
      yield* visitor(oneOfError, example);
    }
  }
}
