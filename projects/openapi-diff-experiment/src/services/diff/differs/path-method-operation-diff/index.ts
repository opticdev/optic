import { OpenAPIDiffingQuestions } from '../../../read/types';
import {
  DiffResult,
  DiffType,
  EitherDiffResult,
  UnmatchedMethod,
} from '../../types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { MatchedUrlPath } from '../url-path-diff';

export type MatchedOperationPath = {
  path: string;
  urlPath: string;
  method: OpenAPIV3.HttpMethods;
  pathParameterValues: { [key: string]: string };
};

export function pathMethodOperationDiffer(
  openapiQuestions: OpenAPIDiffingQuestions
) {
  const operations = openapiQuestions.operations();

  return {
    comparePathAndMethodToOperation: (
      matchedPath: MatchedUrlPath,
      method: OpenAPIV3.HttpMethods
    ): EitherDiffResult<MatchedOperationPath> => {
      try {
        const operationLookup = operations.find(
          (i) => i.path === matchedPath.path && i.method === method
        );

        if (operationLookup) {
          return DiffResult.matchWithContext({ ...matchedPath, method });
        } else if (emitLearnOperationDiffsFor.includes(method)) {
          const unmatchedMethodDiff: UnmatchedMethod = {
            type: DiffType.UnmatchedMethod,
            path: matchedPath.path,
            method,
          };
          return DiffResult.diff([unmatchedMethodDiff]);
        } else {
          return DiffResult.diff([]);
        }
      } catch (e: any) {
        return DiffResult.error(e.message!);
      }
    },
  };
}

const emitLearnOperationDiffsFor = [
  OpenAPIV3.HttpMethods.GET,
  OpenAPIV3.HttpMethods.POST,
  OpenAPIV3.HttpMethods.PUT,
  OpenAPIV3.HttpMethods.PATCH,
  OpenAPIV3.HttpMethods.DELETE,
];
