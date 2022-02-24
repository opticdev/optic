import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  BodyExampleLocation,
  IFact,
  OpenApiFact,
} from '@useoptic/openapi-utilities';

import { SpecFacts } from '../../specs';
import { OpenAPIV3 } from '../../specs';
import { DocumentedBody } from '../body';

export type { DocumentedBody };

export interface DocumentedBodies extends AsyncIterable<DocumentedBody> {}

export class DocumentedBodies {
  static async *fromBodyExampleFacts(
    facts: AsyncIterable<IFact<OpenApiFact>>,
    spec: OpenAPIV3.Document
  ): AsyncIterable<DocumentedBody> {
    let exampleFacts = SpecFacts.bodyExamples(facts);

    for await (let exampleFact of exampleFacts) {
      let exampleBody = exampleFact.value;
      if (!exampleBody) continue; // TODO: add support for external values
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
}
