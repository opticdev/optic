import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  BodyExampleLocation,
  IFact,
  OpenApiFact,
} from '@useoptic/openapi-utilities';

import * as Facts from '../../specs/streams/facts';
import { OpenAPIV3 } from '../../specs';
import { DocumentedBody } from '../body';

export async function* fromBodyExampleFacts(
  facts: AsyncIterable<IFact<OpenApiFact>>,
  spec: OpenAPIV3.Document
): AsyncIterable<DocumentedBody> {
  let exampleFacts = Facts.bodyExamples(facts);

  for await (let exampleFact of exampleFacts) {
    let body = exampleFact.value.value;
    if (!body) continue;

    let conceptualLocation = exampleFact.location
      .conceptualLocation as BodyExampleLocation;
    let jsonPath = exampleFact.location.jsonPath;

    let expectedSchemaPath = jsonPointerHelpers.append(
      'singular' in conceptualLocation
        ? jsonPointerHelpers.pop(jsonPath)
        : jsonPointerHelpers.pop(jsonPointerHelpers.pop(jsonPath)),
      'schema'
    );

    let resolvedSchema = jsonPointerHelpers.tryGet(spec, expectedSchemaPath);
    if (resolvedSchema.match) {
      let schema = resolvedSchema.value;
      yield {
        schema,
        body,
      };
    }
  }
}
