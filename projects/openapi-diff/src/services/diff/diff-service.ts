import { IDiff, IDiffService } from './types';
import { OpenAPIDiffingQuestions } from '../read/types';
import { ApiTraffic } from '../traffic/types';
import { shouldDiffAgainstThisSpec } from './differs/should-diff';
import { urlPathDiff, urlPathDiffFromSpec } from './differs/url-path-diff';
import { JsonSchemaJsonDiffer } from './differs/json-schema-json-diff/types';
import { opticJsonSchemaDiffer } from './differs/json-schema-json-diff';
import { pathMethodOperationDiffer } from './differs/path-method-operation-diff';
import { responsesDiffer } from './differs/responses';

export function createDiffServiceWithCachingProjections(
  spec: OpenAPIDiffingQuestions,
  jsonSchemaDiffer: JsonSchemaJsonDiffer = opticJsonSchemaDiffer()
): IDiffService {
  const shouldDiff = shouldDiffAgainstThisSpec(spec);
  const pathMatcher = urlPathDiffFromSpec(spec);
  const operationMatcher = pathMethodOperationDiffer(spec);
  const responsesMatcher = responsesDiffer(spec, jsonSchemaDiffer);

  return {
    jsonSchemaDiffer,
    compare: async (
      traffic: ApiTraffic
    ): Promise<{ diffs: IDiff[]; errors: string[] }> => {
      /*
        This is nested, feels ugly, but probably is the best way to represent a nested data structure that can be diffed...for now
        open to suggestions
       */
      const continueWithDiff =
        shouldDiff.responseDiffsForTraffic(traffic).isMatch;
      if (!continueWithDiff) return { diffs: [], errors: [] };

      const matchesPath = pathMatcher.compareToPath(
        traffic.method,
        traffic.path
      );

      // here we know we've matched an operation
      if (matchesPath.isMatch) {
        const matchesOperation =
          operationMatcher.comparePathAndMethodToOperation(
            matchesPath.context,
            traffic.method
          );

        if (matchesOperation.isMatch) {
          const results: { diffs: IDiff[]; errors: string[] } = {
            diffs: [],
            errors: [],
          };
          // match the response
          const response = responsesMatcher.responseDiffsForTraffic(
            traffic,
            matchesOperation.context
          );

          if (response.isMatch) {
            // response content & schema diff
            const responseContentMatch =
              responsesMatcher.responseContentDiffsForTraffic(
                traffic,
                response.context
              );

            results.diffs.push(...responseContentMatch.diffs);
          } else results.diffs.push(...response.diffs);

          // collect diffs from failed matches
          return results;
        } else return { diffs: matchesOperation.diffs, errors: [] };
      }
      return { diffs: matchesPath.diffs, errors: [] };
    },
  };
}
