import { OpenAPIDiffingQuestions } from '../../../read/types';
import { ApiTraffic } from '../../../traffic/types';
import {
  DiffResult,
  DiffType,
  EitherDiffResult,
  QueryAdditionalParameter,
} from '../../types';
import { MatchedOperationPath } from '../path-method-operation-diff';
import { parseQueryStringToMap } from './optic-query-string-parser';

export function queryParametersDiffer(
  openApiQuestions: OpenAPIDiffingQuestions
) {
  return {
    queryParamDiffs: (
      apiTraffic: ApiTraffic,
      operationMatch: MatchedOperationPath
    ): EitherDiffResult => {
      const results = parseQueryStringToMap(apiTraffic.queryString);
      const queryParameters = openApiQuestions.queryParametersForOperation(
        operationMatch.method,
        operationMatch.path
      );

      const observedNames = Object.keys(results);
      const documentedNames = queryParameters.map((i) => i.name);

      const newQueryParams = observedNames.filter(
        (x) => !documentedNames.includes(x)
      );

      /*
        Handle Query Param shape diffs later
        handle Query Param required later
       */

      if (newQueryParams.length) {
        return DiffResult.diff(
          newQueryParams.map((name) => {
            const queryParamDiff: QueryAdditionalParameter = {
              type: DiffType.QueryAdditionalParameter,
              path: operationMatch.path,
              method: operationMatch.method,
              name,
              example: results[name],
            };
            return queryParamDiff;
          })
        );
      }

      return DiffResult.match();
    },
  };
}
