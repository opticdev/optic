import {
  BulkUploadJson,
  OPTIC_COMMENT_SURVEY_LINK,
} from '@useoptic/openapi-utilities';

export const createBulkCommentBody = (
  comparisons: BulkUploadJson['comparisons'],
  comparisonsHash: string,
  commit_hash: string,
  run: number
) => {
  const renderedComparisons = comparisons.map((comparison) => {
    const { opticWebUrl, changes, inputs, results } = comparison;

    let totalChecks = results.length;
    let failingChecks = 0;
    let exemptedFailingChecks = 0;

    for (const result of results) {
      if (result.passed) continue;
      if (result.exempted) exemptedFailingChecks += 1;
      else failingChecks += 1;
    }

    const comparisonDescription =
      inputs.from && inputs.to
        ? `changes to \`${inputs.from}\``
        : !inputs.from && inputs.to
        ? `new spec \`${inputs.to}\``
        : inputs.from && !inputs.to
        ? `removed spec \`${inputs.from}\``
        : 'empty specs';

    const exemptedChunk =
      exemptedFailingChecks > 0
        ? ` ${exemptedFailingChecks} would have failed but were exempted.`
        : '';

    const body = `
#### Changelog for [${comparisonDescription}](${opticWebUrl})

  💡 **${changes.length}** API change${changes.length > 1 ? 's' : ''}

  ${
    failingChecks > 0
      ? `⚠️ **${failingChecks}** / **${totalChecks}** checks failed.${exemptedChunk}`
      : totalChecks > 0
      ? `✅ all checks passed (**${totalChecks}**).${exemptedChunk}`
      : `ℹ️  no automated checks have run.`
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
