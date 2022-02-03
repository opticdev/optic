import {
  OpenAPIDiffingQuestions,
  ResponseMatchType,
} from '../../../read/types';
import { ApiTraffic } from '../../../traffic/types';
import {
  DiffResult,
  DiffType,
  EitherDiffResult,
  UnmatchedResponse,
} from '../../types';
import { MatchedOperationPath } from '../path-method-operation-diff';
import { qualifyJsonDiffer } from '../../qualify-schema-differs';
import { JsonSchemaJsonDiffer } from '../json-schema-json-diff/types';
import { opticJsonSchemaDiffer } from '../json-schema-json-diff';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { FieldLocation } from '@useoptic/openapi-utilities';

export function requestsDiffer(
  openApiQuestions: OpenAPIDiffingQuestions,
  jsonSchemaDiffer: JsonSchemaJsonDiffer = opticJsonSchemaDiffer()
) {
  return {
    requestContentDiffsForTraffic: (
      apiTraffic: ApiTraffic,
      operationMatch: MatchedOperationPath
    ): EitherDiffResult => {
      const requestBodies = openApiQuestions.requestBodiesForOperation(
        operationMatch.method,
        operationMatch.path
      );

      // if there's no content type, we don't do anything. This is a request, w/o a content type
      // @todo should have a diff kind about 'required' bodies.
      if (!apiTraffic.requestBody) return DiffResult.diff([]);

      const match = requestBodies.find(
        (i) => i.contentType === apiTraffic.requestBody.contentType
      );

      if (match) {
        if (
          qualifyJsonDiffer(match.contentType) &&
          qualifyJsonDiffer(apiTraffic.requestBody.contentType!)
        ) {
          // we can do shape diffs :)
          try {
            // console.log(match.schema);
            const schemaDiffs = jsonSchemaDiffer.compare(
              match.schema,
              JSON.parse(apiTraffic.requestBody.jsonBodyString),
              match.location,
              jsonPointerHelpers.append(match.jsonPath, 'schema'),
              { collapseToFirstInstanceOfArrayDiffs: true }
            );
            return DiffResult.diff([...schemaDiffs]);
          } catch (e: any) {
            return DiffResult.error(
              `errors diffing json body at ${JSON.stringify(
                match.location
              )}: ` + e.message
            );
          }
        }
      } else if (apiTraffic.requestBody.contentType) {
        // new content type diff -> ie had JSON, then got text or vice versa
        // @todo add this capability
      }

      return DiffResult.diff([]);
    },
  };
}
