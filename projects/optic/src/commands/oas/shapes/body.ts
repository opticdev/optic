import { BodyLocation } from '@useoptic/openapi-utilities';
import { CapturedBody } from '../../capture/interactions/body';
import { ShapePatch } from '.';
import { SchemaObject, Schema } from './schema';
import { Option } from 'ts-results';

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
  body: Option<Body>;
  bodySource?: CapturedBody;
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
