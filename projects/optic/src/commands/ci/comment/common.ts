import { getOperationsChangedLabel } from '@useoptic/openapi-utilities';
import { CiRunDetails } from '../../../utils/ci-data';

const getChecksLabel = (
  results: CiRunDetails['completed'][number]['comparison']['results']
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
      ? ` ${exemptedFailingChecks} were exempted from failing`
      : '';

  return failingChecks > 0
    ? `⚠️ **${failingChecks}** / **${totalChecks}** failed${exemptedChunk}`
    : totalChecks > 0
    ? `✅ all passed (**${totalChecks}**)${exemptedChunk}`
    : `ℹ️ No automated checks have run`;
};

export const COMPARE_SUMMARY_IDENTIFIER = `optic-comment-3UsoJCz_Z0SpGLo5Vjw6o`;

export const generateCompareSummaryMarkdown = (
  commit: { sha: string },
  results: CiRunDetails
) => {
  const anyCompletedHasWarning = results.completed.some(
    (s) => s.warnings.length > 0
  );
  return `
<!--
DO NOT MODIFY
app_id: ${COMPARE_SUMMARY_IDENTIFIER}
commit_sha: ${commit.sha}
-->
${
  results.completed.length > 0
    ? `### APIs Changed

<table>
<thead>
<tr>
<th>API</th>
<th>Preview Documentation</th>
<th>Operation Changes</th>
<th>Checks</th>
${anyCompletedHasWarning ? '<th>Warnings</th>' : ''}
</tr>
</thead>
<tbody>
${results.completed
  .map(
    (s) =>
      `<tr>
<td>

${s.opticWebUrl ? `[${s.apiName}](${s.opticWebUrl})` : s.apiName}

</td>
<td>
  ${s.specUrl ? `([view documentation](${s.specUrl}))` : ''}
</td>
<td>

${getOperationsChangedLabel(s.comparison.groupedDiffs)} ${
        s.opticWebUrl ? `([view changelog](${s.opticWebUrl}))` : ''
      }

</td>
<td>

${getChecksLabel(s.comparison.results)}

</td>
${anyCompletedHasWarning ? `<td>${s.warnings.join('\n')}</td>` : ''}
</tr>`
  )
  .join('\n')}
</tbody>
</table>
`
    : ''
}
${
  results.failed.length > 0
    ? `### Errors running optic

<table>
<thead>
<tr>
<th>API</th>
<th>Error</th>
</tr>
</thead>
<tbody>
${results.failed
  .map(
    (s) => `<tr>
<td>${s.apiName}</td>
<td>

${'```'}
${s.error}
${'```'}

</td>
</tr>`
  )
  .join('\n')}
</tbody>
</table>
`
    : ''
}

Summary of API changes for commit (${commit.sha})

${
  results.noop.length > 0
    ? `${
        results.noop.length === 1 ? '1 API' : `${results.noop.length} APIs`
      } had no changes.`
    : ''
}`;
};

const LOADING_BANNER_IDENTIFIER = 'LOADING-BANNER-zRdRfihnV6eN5__wdKq5A';
export const getHasLoadingBanner = (body: string) =>
  new RegExp(LOADING_BANNER_IDENTIFIER).test(body);

export const createLoadingBanner = (commitSha: string) => `
<!-- ${LOADING_BANNER_IDENTIFIER} -->
> ℹ️ Running update for commit ${commitSha}`;
