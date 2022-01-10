import { ParseOpenAPIResult, sourcemapReader } from '@useoptic/openapi-io';
import { ResultWithSourcemap } from '@useoptic/openapi-utilities';
import { ApiCheckService } from '../../../sdk/api-check-service';

export const generateSpecResults = async <T extends {}>(
  checkService: ApiCheckService<T>,
  from: ParseOpenAPIResult,
  to: ParseOpenAPIResult,
  context: any
): Promise<ResultWithSourcemap[]> => {
  const checkResults = await checkService.runRules(
    from.jsonLike!,
    to.jsonLike!,
    context
  );

  const { findFileAndLines } = sourcemapReader(to.sourcemap);
  return await Promise.all(
    checkResults.map(async (checkResult) => {
      return {
        ...checkResult,
        sourcemap: await findFileAndLines(checkResult.change.location.jsonPath),
      };
    })
  );
};
