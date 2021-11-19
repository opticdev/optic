import { ConceptualLocation, OpenAPIV3 } from '@useoptic/openapi-utilities';
import Ajv, { ErrorObject } from 'ajv';
import { ShapeDiffTypes } from '../../types';
import { JsonSchemaPatch } from './plugins/plugin-types';
import { JsonPatcher } from '../../../patch/incremental-json-patch/json-patcher';

export interface JsonSchemaJsonDiffer {
  ajvToDiff: (
    schema: OpenAPIV3.SchemaObject,
    schemaPath: string,
    diff: ErrorObject,
    example: any,
    location: ConceptualLocation
  ) => ShapeDiffTypes;
  diffToPatch: (
    diff: ShapeDiffTypes,
    patcher: JsonPatcher<OpenAPIV3.Document>
  ) => JsonSchemaPatch[];
  compare: (
    schema: OpenAPIV3.SchemaObject,
    to: any,
    location: ConceptualLocation,
    schemaPath: string,
    options: {
      collapseToFirstInstanceOfArrayDiffs: boolean;
    }
  ) => ShapeDiffTypes[];
  supportedKeywords: string[];
  opticAjv: Ajv;
  stripKeywordsNotSupported: (diffs: ErrorObject[]) => ErrorObject[];
}
