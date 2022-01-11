import { ParseOpenAPIResult, sourcemapReader } from '@useoptic/openapi-io';
import {
  factsToChangelog,
  OpenApiFact,
  IChange,
} from '@useoptic/openapi-utilities';
import { ApiCheckService } from '../../../sdk/api-check-service';
import { ResultWithSourcemap } from '../../../sdk/types';

export const generateSpecResults = async <T extends {}>(
  checkService: ApiCheckService<T>,
  from: ParseOpenAPIResult,
  to: ParseOpenAPIResult,
  context: any
): Promise<{
  changes: IChange<OpenApiFact>[];
  results: ResultWithSourcemap[];
}> => {
  const fromJsonLike = from.jsonLike!;
  const toJsonLike = to.jsonLike!;
  const { currentFacts, nextFacts } = checkService.generateFacts(
    fromJsonLike,
    toJsonLike
  );
  const changes = factsToChangelog(currentFacts, nextFacts);

  const checkResults = await checkService.runRulesWithFacts({
    currentJsonLike: fromJsonLike,
    nextJsonLike: toJsonLike,
    currentFacts,
    nextFacts,
    changelog: changes,
    context,
  });

  const { findFileAndLines } = sourcemapReader(to.sourcemap);
  const results = await Promise.all(
    checkResults.map(async (checkResult) => {
      return {
        ...checkResult,
        sourcemap: await findFileAndLines(checkResult.change.location.jsonPath),
      };
    })
  );
  return {
    changes,
    results,
  };
};
