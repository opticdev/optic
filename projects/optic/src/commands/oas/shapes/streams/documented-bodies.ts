import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  BodyLocation,
  BodyExampleLocation,
  ComponentSchemaLocation,
} from '@useoptic/openapi-utilities';
import { Result, Ok, Err, Option, Some, None } from 'ts-results';
import MIMEType from 'whatwg-mimetype';

import { BodyExampleFacts, ComponentSchemaExampleFacts } from '../../specs';
import { OpenAPIV3 } from '../../specs';
import { Body, DocumentedBody } from '../body';
import {
  DocumentedInteraction,
  findResponse,
  findBody,
} from '../../operations';
import { CapturedBody } from '../../../capture/sources/body';
import { logger } from '../../../../logger';

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
          body: Some(body),
          shapeLocation,
          specJsonPath: bodyPath,
        };
      } else {
        yield {
          body: Some(body),
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
          body: Some(body),
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
    const capturedStatusCode = interaction.response
      ? parseInt(interaction.response.statusCode, 10)
      : null;

    if (
      interaction.request.body &&
      (!capturedStatusCode ||
        (capturedStatusCode >= 200 && capturedStatusCode < 400))
    ) {
      // TODO: consider whether this belongs here, and not in something more specific to patches
      // (as it decides basically what and what not to generate patches for  from)
      let capturedBody = interaction.request.body;
      let { contentType: capturedContentType } = capturedBody;

      let decodedBodyResult = await decodeCapturedBody(capturedBody);
      if (decodedBodyResult.err) {
        console.warn(
          'Could not decode request body of captured interaction:',
          decodedBodyResult.val
        );
        logger.debug('Failing interaction: ' + JSON.stringify(interaction));
      } else if (capturedContentType) {
        let [, matchedContentType] = (operation.requestBody &&
          findBody(operation.requestBody, capturedContentType)) || [null, null];

        if (!matchedContentType) return; // TODO: consider whether silently failing to produce a documented body is right

        let shapeLocation: BodyLocation = {
          path: operation.pathPattern,
          method: operation.method,
          inRequest: {
            body: {
              contentType: matchedContentType,
            },
          },
        };

        let bodyOperationPath = jsonPointerHelpers.compile([
          'requestBody',
          'content',
          matchedContentType,
        ]);
        let bodySpecPath = jsonPointerHelpers.join(
          specJsonPath,
          bodyOperationPath
        );

        let expectedSchemaPath = jsonPointerHelpers.append(
          bodyOperationPath,
          'schema'
        );

        let resolvedSchema = jsonPointerHelpers.tryGet(
          operation,
          expectedSchemaPath
        );

        yield {
          schema: resolvedSchema.match ? resolvedSchema.value : null,
          body: decodedBodyResult.unwrap(),
          bodySource: capturedBody,
          shapeLocation,
          specJsonPath: bodySpecPath,
        };
      } // TODO: consider what to do when there's no content type (happens, as seen in the past)
    }

    if (
      interaction.response &&
      interaction.response.body &&
      capturedStatusCode &&
      capturedStatusCode >= 200 &&
      capturedStatusCode < 500
    ) {
      // TODO: consider whether this belongs here, and not in something more specific to patches
      // (as it decides basically what and what not to generate patches for  from)
      let capturedBody = interaction.response.body;
      let { contentType: capturedContentType } = capturedBody;
      let matchedResponse = findResponse(
        operation,
        interaction.response.statusCode
      );

      let decodedBodyResult = await decodeCapturedBody(capturedBody);
      if (decodedBodyResult.err) {
        console.warn(
          'Could not decode response body of captured interaction:',
          decodedBodyResult.val
        );
        logger.debug('Failing interaction: ' + JSON.stringify(interaction));
      } else if (capturedContentType && matchedResponse) {
        let [response, statusCode] = matchedResponse;
        let [, matchedContentType] = findBody(
          response,
          capturedContentType
        ) || [null, null];

        if (!matchedContentType) return; // TODO: consider whether silently failing to produce a documented body is right

        let shapeLocation: BodyLocation = {
          path: operation.pathPattern,
          method: operation.method,
          inResponse: {
            body: {
              contentType: matchedContentType,
            },
            statusCode,
          },
        };

        let bodyOperationPath = jsonPointerHelpers.compile([
          'responses',
          statusCode,
          'content',
          matchedContentType,
        ]);
        let bodySpecPath = jsonPointerHelpers.join(
          specJsonPath,
          bodyOperationPath
        );

        let expectedSchemaPath = jsonPointerHelpers.append(
          bodyOperationPath,
          'schema'
        );
        let resolvedSchema = jsonPointerHelpers.tryGet(
          operation,
          expectedSchemaPath
        );

        yield {
          schema: resolvedSchema.match ? resolvedSchema.value : null,
          body: decodedBodyResult.unwrap(),
          bodySource: capturedBody,
          shapeLocation,
          specJsonPath: bodySpecPath,
        };
      } // TODO: consider what to do when there's no content type (happens, as seen in the past)
    }
  }
}

async function decodeCapturedBody(
  capturedBody: CapturedBody
): Promise<Result<Option<Body>, string>> {
  // parse the interaction bytes
  let { contentType } = capturedBody;

  let parsedType = contentType && MIMEType.parse(contentType);

  if (!contentType || !parsedType) return Ok(None); // for now, we'll only attempt decoding when we know a content type

  if (
    parsedType.essence === 'application/json' || // IETF RFC 4627
    parsedType.essence === 'text/json' || // valid JSON type according to WHATWG-mimesniff  https://mimesniff.spec.whatwg.org/#mime-type-groups
    parsedType.subtype.endsWith('+json') // IETF RFC 6839
  ) {
    let value;
    try {
      value = await CapturedBody.json(capturedBody);
    } catch (err) {
      return Err(
        `Could not parse captured body as json, ${err}. Tried to parse ${capturedBody.body} as JSON`
      );
    }

    return Ok(
      Some({
        contentType,
        value,
      })
    );
  } // TODO: consider what to do when there's no content type (happens, as seen in the past)

  return Ok(None); // no decoded body available
}
