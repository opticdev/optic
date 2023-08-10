import { JsonPath } from '@useoptic/openapi-io';
import { JsonSchemaKnownKeyword } from './traverser';

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
