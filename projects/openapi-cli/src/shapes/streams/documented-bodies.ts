import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  BodyLocation,
  BodyExampleLocation,
  ComponentSchemaLocation,
  IFact,
  OpenApiFact,
} from '@useoptic/openapi-utilities';
import { Result, Ok, Err } from 'ts-results';

import { BodyExampleFacts, ComponentSchemaExampleFacts } from '../../specs';
import { OpenAPIV3 } from '../../specs';
import { Body, DocumentedBody } from '../body';
import { CapturedBody, CapturedBodies } from '../../captures';
import { DocumentedInteraction, findResponse } from '../../operations';

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

  static async *fromDocumentedInteraction({
    interaction,
    specJsonPath,
    operation,
  }: DocumentedInteraction): AsyncIterable<DocumentedBody> {
    if (interaction.request.body) {
      let { contentType } = interaction.request.body;
      let decodedBodyResult = await decodeCapturedBody(
        interaction.request.body
      );
      if (decodedBodyResult.err) {
        console.warn(
          'Could not decode body of captured interaction:',
          decodedBodyResult.val
        );
      } else if (contentType) {
        let shapeLocation: BodyLocation = {
          path: operation.pathPattern,
          method: operation.method,
          inRequest: {
            body: {
              contentType,
            },
          },
        };

        let bodyOperationPath = jsonPointerHelpers.compile([
          'requestBody',
          'content',
          contentType,
        ]);
        let bodySpecPath = jsonPointerHelpers.join(
          specJsonPath,
          bodyOperationPath
        );

        let resolvedSchema = jsonPointerHelpers.tryGet(
          operation,
          bodyOperationPath
        );

        yield {
          schema: resolvedSchema.match ? resolvedSchema.value : null,
          body: decodedBodyResult.unwrap(),
          shapeLocation,
          specJsonPath: bodySpecPath,
        };
      } // TODO: consider what to do when there's no content type (happens, as seen in the past)
    }

    if (interaction.response.body) {
      let { contentType } = interaction.response.body;
      let matchedResponse = findResponse(
        operation,
        interaction.response.statusCode
      );

      let decodedBodyResult = await decodeCapturedBody(
        interaction.response.body
      );
      if (decodedBodyResult.err) {
        console.warn(
          'Could not decode body of captured interaction:',
          decodedBodyResult.val
        );
      } else if (contentType && matchedResponse) {
        let [, statusCode] = matchedResponse;

        let shapeLocation: BodyLocation = {
          path: operation.pathPattern,
          method: operation.method,
          inResponse: {
            body: {
              contentType,
            },
            statusCode,
          },
        };

        let bodyOperationPath = jsonPointerHelpers.compile([
          'responses',
          statusCode,
          'content',
          contentType,
        ]);
        let bodySpecPath = jsonPointerHelpers.join(
          specJsonPath,
          bodyOperationPath
        );

        let resolvedSchema = jsonPointerHelpers.tryGet(
          operation,
          bodyOperationPath
        );

        yield {
          schema: resolvedSchema.match ? resolvedSchema.value : null,
          body: decodedBodyResult.unwrap(),
          shapeLocation,
          specJsonPath: bodySpecPath,
        };
      } // TODO: consider what to do when there's no content type (happens, as seen in the past)
    }
  }
}

async function decodeCapturedBody(
  capturedBody: CapturedBody
): Promise<Result<Body, string>> {
  // parse the interaction bytes
  let { contentType } = capturedBody;

  if (contentType && contentType.startsWith('application/json')) {
    let value;
    try {
      value = await CapturedBody.json(capturedBody);
    } catch (err) {
      return Err('Could not parse captured body as json');
    }

    return Ok({
      contentType,
      value,
    });
  } // TODO: consider what to do when there's no content type (happens, as seen in the past)

  return Err('Could not decode captured body');
}
