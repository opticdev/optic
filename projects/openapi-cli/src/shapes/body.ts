import { BodyLocation } from '@useoptic/openapi-utilities';
import { ShapePatch } from '.';
import { CapturedBody } from '../captures';
import { OpenAPIV3 } from '../specs/index';
import { SchemaObject, Schema } from './schema';
import { Result, Ok, Err } from 'ts-results';

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

  static async fromCapturedBody(
    capturedBody: CapturedBody,
    spec: OpenAPIV3.MediaTypeObject
  ): Promise<Result<DocumentedBody, string>> {
    let { contentType } = capturedBody;

    if (!contentType || contentType.startsWith('application/json')) {
      let value;
      try {
        value = await CapturedBody.json(capturedBody);
      } catch (err) {
        return Err('Could not parse captured body as json');
      }

      return {
        schema: spec.schema,
      };
    } else {
      return Err(
        `Could not determine parsing strategy for body with content type '${contentType}'`
      );
    }
  }
}
