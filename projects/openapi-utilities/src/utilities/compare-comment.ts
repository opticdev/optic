import { CompareFileJson } from '../ci-types';
import { OPTIC_COMMENT_SURVEY_LINK } from './shared-comment';
import { isChangeVariant } from '../openapi3/sdk/isType';
import { OpenApiKind, IChange } from '../openapi3/sdk/types';

const countChangedOperations = (changes: IChange[]) => {
  const operations = new Set();
  for (const change of changes) {
    if (isChangeVariant(change, OpenApiKind.Specification)) continue;
    const path = (change.location.conceptualLocation as any).path;
    const method = (change.location.conceptualLocation as any).method;
    if (!path || !method) continue;
    const operationId = `${path}.${method}`;
    operations.add(operationId);
  }
  return operations.size;
};

export const createCommentBody = (
  results: CompareFileJson['results'],
  changes: CompareFileJson['changes'],
  compareHash: string,
  commit_hash: string,
  run: number,
  opticWebUrl: string
) => {
  let totalChecks = results.length;
  let failingChecks = 0;
  let exemptedFailingChecks = 0;

  for (const result of results) {
    if (result.passed) continue;
    if (result.exempted) exemptedFailingChecks += 1;
    else failingChecks += 1;
  }

  const operationsChanged = countChangedOperations(changes);

  const exemptedChunk =
    exemptedFailingChecks > 0
      ? ` ${exemptedFailingChecks} would have failed but were exempted.`
      : '';

  const body = `<!-- DO NOT MODIFY - OPTIC IDENTIFIER: ${compareHash} -->
  ### New changes to your OpenAPI spec

  Summary of run [#${run}](${opticWebUrl}) results (${commit_hash}):

  💡 **${operationsChanged}** API operation${
    operationsChanged > 1 ? 's' : ''
  } changed

  ${
    failingChecks > 0
      ? `⚠️ **${failingChecks}** / **${totalChecks}** checks failed.${exemptedChunk}`
      : totalChecks > 0
      ? `✅ all checks passed (**${totalChecks}**).${exemptedChunk}`
      : `ℹ️ No automated checks have run.`
  }

  For details, see [the Optic API Changelog](${opticWebUrl})

  ------
  How can Optic be improved? Leave your feedback [here](${OPTIC_COMMENT_SURVEY_LINK})
`;

  return body;
};
