import { IDiff } from '../../../types';
import Ajv, { ErrorObject } from 'ajv';
import { BodyLocation, OpenAPIV3 } from '@useoptic/openapi-utilities';
import {
  IPatchGroup,
  JsonPatcher,
} from '../../../../patch/incremental-json-patch/json-patcher';
import { JsonSchemaJsonDiffer } from '../types';

export interface JsonSchemaDiffPlugin<T extends IDiff> {
  keyword: string;
  attachKeyword?: (opticAjv: Ajv) => void;
  emitDiff: (
    schemaPath: string,
    validationError: ErrorObject,
    example: any,
    conceptualLocation: BodyLocation
  ) => T;
  shapePatches: (
    diff: T,
    differ: JsonSchemaJsonDiffer,
    patcher: JsonPatcher<OpenAPIV3.Document>
  ) => JsonSchemaPatch[];
}

export enum JsonSchemaPatchClassification {
  Compatible = 'Compatible',
  Incompatible = 'Incompatible',
}
export interface JsonSchemaPatch {
  effect: string;
  classification: JsonSchemaPatchClassification;
  extends: boolean;
  patch: IPatchGroup[];
}

export enum JsonSchemaKnownKeyword {
  required = 'required',
  additionalProperties = 'additionalProperties',
  type = 'type',
  oneOf = 'oneOf',
}
