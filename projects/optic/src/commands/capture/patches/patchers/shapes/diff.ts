import jsonSchemaTraverse from 'json-schema-traverse';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Ono } from '@jsdevtools/ono';
import { Result, Ok, Err } from 'ts-results';
import { JsonPath } from '@useoptic/openapi-io';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { SchemaObject } from './schema';
import { Body } from './documented-bodies';
import { additionalPropertiesDiffs } from './handlers/additionalProperties';
import { oneOfKeywordDiffs } from './handlers/oneOf';
import { requiredKeywordDiffs } from './handlers/required';
import { typeKeywordDiffs } from './handlers/type';
import { enumKeywordDiffs } from './handlers/enum';

export function diffBodyBySchema(
  body: Body,
  schema: SchemaObject
): Result<IterableIterator<ShapeDiffResult>, SchemaCompilationError> {
  let traverser = new ShapeDiffTraverser();
  return traverser.traverse(body.value, schema).map(() => traverser.results());
}

function* diffVisitors(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  for (let visitor of [
    additionalPropertiesDiffs,
    oneOfKeywordDiffs,
    requiredKeywordDiffs,
    typeKeywordDiffs,
    enumKeywordDiffs,
  ]) {
    yield* visitor(validationError, example);
  }
}

export enum ShapeDiffResultKind {
  AdditionalProperty = 'AdditionalProperty',
  MissingRequiredProperty = 'MissingRequiredProperty',
  MissingEnumValue = 'MissingEnumValue',
  UnmatchedType = 'UnmatchedType',
}

// The result of matching a body against it's (JSON) schema
export type ShapeDiffResult = {
  keyword: JsonSchemaKnownKeyword;
  key: string;
  example: any;
  instancePath: JsonPath;
  description: string;
} & (
  | {
      kind: ShapeDiffResultKind.AdditionalProperty;
      keyword: JsonSchemaKnownKeyword.additionalProperties;

      propertyExamplePath: JsonPath;
      parentObjectPath: JsonPath;
      propertyPath: JsonPath;
    }
  | {
      kind: ShapeDiffResultKind.MissingRequiredProperty;
      keyword: JsonSchemaKnownKeyword.required;

      parentObjectPath: JsonPath;
      propertyPath: JsonPath;
    }
  | {
      kind: ShapeDiffResultKind.UnmatchedType;
      keyword: JsonSchemaKnownKeyword.type | JsonSchemaKnownKeyword.oneOf;
      expectedType: string;

      propertyPath: JsonPath;
    }
  | {
      kind: ShapeDiffResultKind.MissingEnumValue;
      keyword: JsonSchemaKnownKeyword.enum;
      value: string;
      propertyPath: JsonPath;
    }
);

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
    // Sometimes the schema path returned from AJV is encoded
    let validationErrors = this.validate.errors.map((e) => ({
      ...e,
      schemaPath: decodeURIComponent(e.schemaPath),
    }));
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
  enum = 'enum',
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
        if (schema.oneOf || schema.anyOf || schema.allOf) {
          // in the polymorphic case we have to remove nullable, since type will override and you cannot use
          delete schema.nullable;
        } else {
          // We set this to string since we're not sure what the actual type is; this should be fine for us since we'll use this schema for diffing purposes and update
          schema.type = 'string';
        }
      }
    },
  });
  return schema;
}
