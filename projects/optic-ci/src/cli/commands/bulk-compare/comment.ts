import { BulkUploadJson } from '../../types';
import { OPTIC_COMMENT_SURVEY_LINK } from '../utils/shared-comment';

export const createBulkCommentBody = (
  comparisons: BulkUploadJson['comparisons'],
  comparisonsHash: string,
  commit_hash: string,
  run: number
) => {
  const renderedComparisons = comparisons.map((comparison) => {
    const { opticWebUrl, changes, inputs, results } = comparison;
    const failingChecks = results.filter((result) => !result.passed).length;
    const totalChecks = results.length;

    const comparisonDescription =
      inputs.from && inputs.to
        ? `changes to \`${inputs.from}\``
        : !inputs.from && inputs.to
        ? `new spec \`${inputs.to}\``
        : inputs.from && !inputs.to
        ? `removed spec \`${inputs.from}\``
        : 'empty specs';
    const body = `
#### Changelog for [${comparisonDescription}](${opticWebUrl})

  💡 **${changes.length}** API change${changes.length > 1 ? 's' : ''}

  ${
    failingChecks > 0
      ? `⚠️ **${failingChecks}** / **${totalChecks}** checks failed.`
      : totalChecks > 0
      ? `✅ all checks passed (**${totalChecks}**).`
      : `ℹ️ No automated checks have run.`
  }
`;
    return body;
  });

  const body = `<!-- DO NOT MODIFY - OPTIC IDENTIFIER: ${comparisonsHash} -->
### New changes to your OpenAPI specs

Summary of run # ${run} results (${commit_hash}):

${renderedComparisons.join(`\n---\n`)}

------
How can Optic be improved? Leave your feedback [here](${OPTIC_COMMENT_SURVEY_LINK})
  `;

  return body;
};
