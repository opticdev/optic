import jsonSchemaTraverse from 'json-schema-traverse';
import { SchemaObject } from '..';
import { ShapeDiffResult } from './result';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import { OpenAPIV3 } from '../../specs';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Ono } from '@jsdevtools/ono';
import { Result, Ok, Err } from 'ts-results';

import { diffVisitors } from './visitors';

export type { ErrorObject };

export class ShapeDiffTraverser {
  private validator: Ajv;

  private validate?: ValidateFunction;
  private bodyValue?: any;

  constructor() {
    this.validator = new Ajv({
      allErrors: true,
      validateFormats: false,
      strictSchema: false,
      strictTypes: false,
      useDefaults: true,
    });
  }

  traverse(
    bodyValue: any,
    schema: SchemaObject
  ): Result<void, SchemaCompilationError> {
    this.bodyValue = bodyValue;
    try {
      this.validate = this.validator.compile(prepareSchemaForDiff(schema));
    } catch (err) {
      // Catching and not throwing is okay here. `validator.compile` is stateless, with all state for the validator
      // being contained by the function that now doesn't get assigned.
      const wrapped = new SchemaCompilationError(err as Error);
      return Err(wrapped);
    }

    this.validate(bodyValue);

    return Ok.EMPTY;
  }

  *results(): IterableIterator<ShapeDiffResult> {
    if (!this.validate || !this.validate.errors) return;
    let validationErrors = this.validate.errors;

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
        let oneOfPath = schemaPath.slice(
          0,
          schemaPath.lastIndexOf('oneOf') + 1
        );
        let branchPath = schemaPath.slice(oneOfPath.length);

        // TODO: consider hardening detection of one of branches. Going just off string keynames could
        // potentially be ugly, as we're dealing with partially user-definable input (property names).
        if (
          (branchPath.length == 2 &&
            branchPath[1] === JsonSchemaKnownKeyword.type) ||
          (branchPath.length === 3 &&
            branchPath[1] === 'items' &&
            branchPath[2] === JsonSchemaKnownKeyword.type)
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
        yield* diffVisitors(validationError, this.bodyValue);
      }
    }

    for (let [oneOfPath, otherBranchError] of oneOfBranchOther) {
      // any nested errors are all safe to visit
      yield* diffVisitors(otherBranchError, this.bodyValue);

      // once a nested error has been visited, we consider this a branch type match
      oneOfs.delete(oneOfPath);
      oneOfBranchType = oneOfBranchType.filter(
        ([branchOneOfPath, _]) => oneOfPath !== branchOneOfPath
      );
    }

    // visit any left over one ofs
    for (let oneOfError of oneOfs.values()) {
      yield* diffVisitors(oneOfError, this.bodyValue);
    }
  }
}

export enum JsonSchemaKnownKeyword {
  required = 'required',
  additionalProperties = 'additionalProperties',
  type = 'type',
  oneOf = 'oneOf',
}

export class SchemaCompilationError extends Error {
  constructor(ajvError: Error) {
    super(`Error compiling schema: ${ajvError.message}`);
    Ono.extend(this, ajvError);
    Object.setPrototypeOf(this, SchemaCompilationError.prototype);
  }
}

function prepareSchemaForDiff(input: SchemaObject): SchemaObject {
  const schema: SchemaObject = JSON.parse(JSON.stringify(input));
  jsonSchemaTraverse(schema as OpenAPIV3.SchemaObject, {
    allKeys: true,
    cb: (schema) => {
      /*
        Some developers don't set all the JSON Schema properties because it's quite verbose,
        effectively underspecifing their schemas. Optic tries to apply sensible defaults,
        which are easy to override by writing your schemas properly
       */
      if (
        schema.type === 'object' &&
        !schema.hasOwnProperty('additionalProperties')
      ) {
        schema['additionalProperties'] = false;
      }

      // Fix case where nullable is set and there is no type key
      if (!schema.type && schema.nullable) {
        // We set this to string since we're not sure what the actual type is; this should be fine for us since we'll use this schema for diffing purposes and update
        schema.type = 'string';
      }
    },
  });
  return schema;
}
