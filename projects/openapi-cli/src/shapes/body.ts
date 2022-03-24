import { BodyLocation } from '@useoptic/openapi-utilities';
import { ShapePatch } from '.';
import { OpenAPIV3 } from '../specs/index';
import { SchemaObject, Schema } from './schema';

export interface Body {
  contentType?: string;
  value: any;
}

export type { BodyLocation };

export type ShapeLocation =
  | BodyLocation
  | {
      inComponentSchema: {
        schemaName: string;
      };
    };

export interface DocumentedBody {
  body: Body;
  schema: SchemaObject | null;
  shapeLocation: ShapeLocation | null;
  specJsonPath: string;
}

export class DocumentedBody {
  static applyShapePatch(
    body: DocumentedBody,
    patch: ShapePatch
  ): DocumentedBody {
    return {
      ...body,
      schema: Schema.applyShapePatch(body.schema || {}, patch),
    };
  }
}
