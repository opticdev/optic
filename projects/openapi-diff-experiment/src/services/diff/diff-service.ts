import { DiffResult, EitherDiffResult, IDiff, IDiffService } from './types';
import { OpenAPIDiffingQuestions } from '../read/types';
import { ApiTraffic } from '../traffic/types';
import { shouldDiffAgainstThisSpec } from './differs/should-diff';
import { urlPathDiff, urlPathDiffFromSpec } from './differs/url-path-diff';
import { JsonSchemaJsonDiffer } from './differs/json-schema-json-diff/types';
import { opticJsonSchemaDiffer } from './differs/json-schema-json-diff';
import { pathMethodOperationDiffer } from './differs/path-method-operation-diff';
import { responsesDiffer } from './differs/responses';
import { queryParametersDiffer } from './differs/query-parameters';
import { requestsDiffer } from './differs/requests';

export function createDiffServiceWithCachingProjections(
  spec: OpenAPIDiffingQuestions,
  jsonSchemaDiffer: JsonSchemaJsonDiffer = opticJsonSchemaDiffer()
): IDiffService {
  const shouldDiff = shouldDiffAgainstThisSpec(spec);
  const pathMatcher = urlPathDiffFromSpec(spec);
  const operationMatcher = pathMethodOperationDiffer(spec);
  const requestMatcher = requestsDiffer(spec, jsonSchemaDiffer);
  const responsesMatcher = responsesDiffer(spec, jsonSchemaDiffer);
  const queryParamDiffer = queryParametersDiffer(spec);

  return {
    jsonSchemaDiffer,
    compare: async (
      traffic: ApiTraffic
    ): Promise<{ diffs: IDiff[]; errors: string[] }> => {
      const diffResult: { diffs: IDiff[]; errors: string[] } = {
        diffs: [],
        errors: [],
      };

      const appendDiffResult = <A>(result: EitherDiffResult<A>) => {
        diffResult.diffs.push(...result.diffs);
        if (result.error) diffResult.errors.push(result.error);
      };

      /*
        This is nested, feels ugly, but probably is the best way to represent a nested data structure that can be diffed...for now
        open to suggestions
       */
      const continueWithDiff =
        shouldDiff.responseDiffsForTraffic(traffic).isMatch;
      if (!continueWithDiff) return diffResult;

      const matchesPath = pathMatcher.compareToPath(
        traffic.method,
        traffic.path
      );

      appendDiffResult(matchesPath);

      // here we know we've matched an operation
      if (matchesPath.isMatch) {
        const matchesOperation =
          operationMatcher.comparePathAndMethodToOperation(
            matchesPath.context,
            traffic.method
          );

        appendDiffResult(matchesOperation);

        if (matchesOperation.isMatch) {
          // check the query parameters
          const queryParamResult = queryParamDiffer.queryParamDiffs(
            traffic,
            matchesOperation.context
          );
          appendDiffResult(queryParamResult);

          // match the request
          const request = requestMatcher.requestContentDiffsForTraffic(
            traffic,
            matchesOperation.context
          );

          appendDiffResult(request);

          // match the response
          const response = responsesMatcher.responseDiffsForTraffic(
            traffic,
            matchesOperation.context
          );

          appendDiffResult(response);

          if (response.isMatch) {
            // response content & schema diff
            const responseContentMatch =
              responsesMatcher.responseContentDiffsForTraffic(
                traffic,
                response.context
              );

            appendDiffResult(responseContentMatch);
          }
        }
      }

      return diffResult;
    },
  };
}
