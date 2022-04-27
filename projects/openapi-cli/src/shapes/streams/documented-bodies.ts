import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  BodyExampleLocation,
  ComponentSchemaLocation,
  IFact,
  OpenApiFact,
} from '@useoptic/openapi-utilities';
import { Result, Ok, Err } from 'ts-results';

import { BodyExampleFacts, ComponentSchemaExampleFacts } from '../../specs';
import { OpenAPIV3 } from '../../specs';
import { DocumentedBody } from '../body';
import { CapturedBody, CapturedBodies } from '../../captures';

export type { DocumentedBody };

export interface DocumentedBodies extends AsyncIterable<DocumentedBody> {}

export class DocumentedBodies {
  static async *fromBodyExampleFacts(
    exampleFacts: BodyExampleFacts,
    spec: OpenAPIV3.Document
  ): AsyncIterable<DocumentedBody> {
    for await (let exampleFact of exampleFacts) {
      let exampleBody = exampleFact.value;
      if (!exampleBody || !exampleBody.value) continue; // TODO: add support for external values
      let body = {
        contentType: exampleBody.contentType,
        value: exampleBody.value,
      };

      let conceptualLocation = exampleFact.location
        .conceptualLocation as BodyExampleLocation;
      let jsonPath = exampleFact.location.jsonPath;

      let shapeLocation = conceptualLocation; // bit nasty, relying on BodyExampleLocation being a superset of BodyLocation

      let bodyPath =
        'singular' in conceptualLocation
          ? jsonPointerHelpers.pop(jsonPath)
          : jsonPointerHelpers.pop(jsonPointerHelpers.pop(jsonPath));
      let expectedSchemaPath = jsonPointerHelpers.append(bodyPath, 'schema');

      let resolvedSchema = jsonPointerHelpers.tryGet(spec, expectedSchemaPath);

      if (resolvedSchema.match) {
        let schema = resolvedSchema.value;
        yield {
          schema,
          body,
          shapeLocation,
          specJsonPath: bodyPath,
        };
      } else {
        yield {
          body,
          schema: null,
          shapeLocation,
          specJsonPath: bodyPath,
        };
      }
    }
  }

  static async *fromComponentSchemaExampleFacts(
    exampleFacts: ComponentSchemaExampleFacts,
    spec: OpenAPIV3.Document
  ): AsyncIterable<DocumentedBody> {
    for await (let exampleFact of exampleFacts) {
      let body = {
        value: exampleFact.value,
      };

      let jsonPath = exampleFact.location.jsonPath;
      let conceptualLocation = exampleFact.location
        .conceptualLocation as ComponentSchemaLocation;

      let expectedSchemaPath = jsonPointerHelpers.pop(jsonPath); // example lives nested in schema

      let resolvedSchema = jsonPointerHelpers.tryGet(spec, expectedSchemaPath);

      if (resolvedSchema.match) {
        let schema = resolvedSchema.value;
        yield {
          schema,
          body,
          shapeLocation: conceptualLocation,
          specJsonPath: expectedSchemaPath,
        };
      }
    }
  }

  static async *fromCapturedBodies(
    capturedBodies: CapturedBodies,
    spec: OpenAPIV3.Document
  ): AsyncIterable<Result<DocumentedBody, string>> {
    for await (let capturedBody of capturedBodies) {
      let { contentType } = capturedBody;

      if (!contentType || contentType.startsWith('application/json')) {
        let value;
        try {
          value = await CapturedBody.json(capturedBody);
        } catch (err) {
          yield Err('Could not parse captured body as json');
        }
      }
    }
  }
}
