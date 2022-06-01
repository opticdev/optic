import { CompareJson } from '../../types';
import { OPTIC_COMMENT_SURVEY_LINK } from '../utils/shared-comment';

export const createCommentBody = (
  results: CompareJson['results'],
  changes: CompareJson['changes'],
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

  const exemptedChunk =
    exemptedFailingChecks > 0
      ? ` ${exemptedFailingChecks} would have failed but were exempted.`
      : '';

  const body = `<!-- DO NOT MODIFY - OPTIC IDENTIFIER: ${compareHash} -->
  ### New changes to your OpenAPI spec

  Summary of run [#${run}](${opticWebUrl}) results (${commit_hash}):

  💡 **${changes.length}** API change${changes.length > 1 ? 's' : ''}

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
