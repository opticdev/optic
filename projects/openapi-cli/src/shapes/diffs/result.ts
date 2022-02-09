import { FieldLocation } from '@useoptic/openapi-utilities';
import { JsonPath } from '@useoptic/openapi-io';
import { JsonSchemaKnownKeyword } from './traverser';

export enum ShapeDiffResultKind {
  AdditionalProperty = 'AdditionalProperty',
  MissingRequiredProperty = 'MissingRequiredProperty',
  UnmatchedType = 'UnmatchedType',
}

export type ShapeDiffResult = {
  kind: ShapeDiffResultKind;
  keyword: JsonSchemaKnownKeyword;

  // TODO: figure out if location belongs here, or whether one level up (its just passed
  // in and attached, not needed for logic)
  // location: FieldLocation;
  key: string;
  example: any;
  schemaPath: JsonPath;
  instancePath: JsonPath;
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

      propertyPath: JsonPath;
    }
);
