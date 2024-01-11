import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { BodyLocation } from '@useoptic/openapi-utilities';
import { Result, Ok, Err, Option, Some, None } from 'ts-results';
import MIMEType from 'whatwg-mimetype';

import {
  DocumentedInteraction,
  findResponse,
  findBody,
} from '../../../../oas/operations';
import { CapturedBody } from '../../../sources/body';
import { logger } from '../../../../../logger';
import { ShapePatch } from './patches';
import { Schema, SchemaObject } from './schema';
import { CapturedInteraction } from '../../../sources/captured-interactions';

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
  interaction: CapturedInteraction;
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

export interface DocumentedBodies extends AsyncIterable<DocumentedBody> {}

export class DocumentedBodies {
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
          interaction,
        };
      } // TODO: consider what to do when there's no content type (happens, as seen in the past)
    } else if (interaction.request.body) {
      logger.debug(
        `skipping documenting request body for ${interaction.request.method} ${
          interaction.request.path
        } because response status code is ${
          capturedStatusCode ? capturedStatusCode : 'null'
        }`
      );
    }

    if (
      interaction.response?.body &&
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
          interaction,
        };
      } else {
        logger.debug(
          `skipping documenting response body for ${interaction.request.method} ${interaction.request.path} because there is no content type`
        );
      }
    } else if (interaction.response?.body) {
      logger.debug(
        `skipping documenting response body for ${interaction.request.method} ${
          interaction.request.path
        } because response status code is ${
          capturedStatusCode ? capturedStatusCode : 'null'
        }`
      );
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
      logger.error;
      return Err(
        `Could not parse captured body as json. Tried to parse ${capturedBody.body} as JSON`
      );
    }

    return Ok(
      Some({
        contentType,
        value,
      })
    );
  } else if (parsedType.essence === 'multipart/form-data') {
    return Ok(
      Some({
        contentType,
        value: capturedBody.body
          ? parseMultipartFormBody(capturedBody.contentType!, capturedBody.body)
          : {},
      })
    );
  } else if (parsedType.essence === 'application/x-www-form-urlencoded') {
    const searchParams = new URLSearchParams(capturedBody.body ?? '');
    const parsed = {};
    for (const [key, v] of searchParams) parsed[key] = v;

    return Ok(
      Some({
        contentType,
        value: parsed,
      })
    );
  } else {
    return Ok(
      Some({
        contentType,
        value: capturedBody.body,
      })
    );
  }
}

function parseMultipartFormBody(
  contentType: string,
  body: string
): Record<string, string> {
  // Expected contentType to be format of
  // multipart/form-data; boundary=---------------------------123456789
  const boundary = contentType.split(';')[1].split('=')[1].trim();

  // Here we just care about the field names
  // the boundary could be padded with `-`
  const chunks = body
    .split(new RegExp(`-*${boundary}-*[\\r\\n]+`))
    .slice(1, -1);
  const parsed = {};

  for (let chunk of chunks) {
    const disposition = chunk
      .split(/[\r\n]+/)
      .find((l) => /^Content-Disposition/i.test(l));
    // Example line:
    // Content-Disposition: form-data; name="file"; filename="upload.txt"
    const nameMatch = disposition
      ?.split(';')
      .filter((l) => /name=".+"/.test(l))[0]
      ?.match(/name="(.+)"/);
    if (!nameMatch || !nameMatch[1]) continue;
    const name = nameMatch[1];
    // Remove header rows to get the raw content and the trailing line breaks
    chunk = chunk
      .replace(/^Content-Disposition.+[\r\n]+/i, '')
      .replace(/^Content-Type.+[\r\n]+/i, '') // Content-type is only set for files (i.e. has `filename="..."`)
      .replace(/[\r\n]+$/, '');

    parsed[name] = chunk;
  }
  return parsed;
}
