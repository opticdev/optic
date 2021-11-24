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

export function responsesDiffer(
  openApiQuestions: OpenAPIDiffingQuestions,
  jsonSchemaDiffer: JsonSchemaJsonDiffer = opticJsonSchemaDiffer()
) {
  return {
    responseDiffsForTraffic: (
      apiTraffic: ApiTraffic,
      operationMatch: MatchedOperationPath
    ): EitherDiffResult<ResponseMatchType> => {
      const responses = openApiQuestions.responsesForOperation(
        operationMatch.method,
        operationMatch.path
      );

      const matchExact = responses.find(
        (res) => res.statusCodeMatcher === apiTraffic.response.statusCode
      );
      const matchRange = responses
        .filter((res) => Boolean(res.statusCodeMatcher.match(/[245]xx/)))
        .find(
          (res) =>
            res.statusCodeMatcher.substring(0, 1) ===
            apiTraffic.response.statusCode.substring(0, 1)
        );

      const matchDefault = responses.find(
        (res) => res.statusCodeMatcher === 'default'
      );

      const response = matchExact || matchRange || matchDefault;

      if (response) {
        return DiffResult.matchWithContext(response);
      } else {
        const asNumber = Number(apiTraffic.response.statusCode);
        // only qualify the following range of status codes
        if (asNumber >= 200 && asNumber < 500) {
          const unmatched: UnmatchedResponse = {
            type: DiffType.UnmatchedResponse,
            path: operationMatch.path,
            method: operationMatch.method,
            statusCode: apiTraffic.response.statusCode,
          };
          return DiffResult.diff([unmatched]);
        }
      }

      return DiffResult.diff([]);
    },

    responseContentDiffsForTraffic: (
      apiTraffic: ApiTraffic,
      responseMatch: ResponseMatchType
    ): EitherDiffResult => {
      // if there's no content type, we don't do anything. This is a response, w/o a content type
      if (!apiTraffic.response.body.contentType) return DiffResult.diff([]);

      const match = responseMatch.contentTypes.find(
        (content) =>
          content.contentType === apiTraffic.response.body.contentType
      );
      if (match) {
        if (
          qualifyJsonDiffer(match.contentType) &&
          qualifyJsonDiffer(apiTraffic.response.body.contentType!)
        ) {
          // we can do shape diffs :)
          try {
            // console.log(match.schema);
            const schemaDiffs = jsonSchemaDiffer.compare(
              match.schema,
              JSON.parse(apiTraffic.response.body.jsonBodyString),
              {
                ...match.location,
                jsonSchemaTrail: []
              },
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
      } else if (apiTraffic.response.body.contentType) {
        // new content type diff
        // @todo add this capability
      }

      return DiffResult.diff([]);
    },
  };
}
