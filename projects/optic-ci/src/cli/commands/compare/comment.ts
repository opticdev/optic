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
  const failingChecks = results.filter((result) => !result.passed).length;
  const totalChecks = results.length;

  const body = `<!-- DO NOT MODIFY - OPTIC IDENTIFIER: ${compareHash} -->
  ### New changes to your OpenAPI spec

  Summary of run [#${run}](${opticWebUrl}) results (${commit_hash}):

  💡 **${changes.length}** API change${changes.length > 1 ? 's' : ''}

  ${
    failingChecks > 0
      ? `⚠️ **${failingChecks}** / **${totalChecks}** checks failed.`
      : totalChecks > 0
      ? `✅ all checks passed (**${totalChecks}**).`
      : `ℹ️ No automated checks have run.`
  }
  
  For details, see [the Optic API Changelog](${opticWebUrl})

  ------
  How can Optic be improved? Leave your feedback [here](${OPTIC_COMMENT_SURVEY_LINK})
`;

  return body;
};
