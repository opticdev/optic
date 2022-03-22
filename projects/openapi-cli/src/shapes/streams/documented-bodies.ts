import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  BodyExampleLocation,
  IFact,
  OpenApiFact,
} from '@useoptic/openapi-utilities';

import { BodyExampleFacts, ComponentSchemaExampleFacts } from '../../specs';
import { OpenAPIV3 } from '../../specs';
import { DocumentedBody } from '../body';

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

      let bodyLocation = conceptualLocation; // bit nasty, relying on BodyExampleLocation being a superset of BodyLocation

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
          bodyLocation,
          specJsonPath: bodyPath,
        };
      } else {
        yield {
          body,
          schema: null,
          bodyLocation,
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
      let exampleBody = exampleFact.value;
      let body = {
        value: exampleBody.value,
      };

      let jsonPath = exampleFact.location.jsonPath;

      let expectedSchemaPath = jsonPointerHelpers.pop(jsonPath); // example lives nested in schema

      let resolvedSchema = jsonPointerHelpers.tryGet(spec, expectedSchemaPath);

      if (resolvedSchema.match) {
        let schema = resolvedSchema.value;
        yield {
          schema,
          body,
          bodyLocation: null,
          specJsonPath: expectedSchemaPath,
        };
      }
    }
  }
}
