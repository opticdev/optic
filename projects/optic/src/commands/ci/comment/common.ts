import {
  Severity,
  getOperationsChangedLabel,
  getOperationsChanged,
} from '@useoptic/openapi-utilities';
import { CiRunDetails } from '../../../utils/ci-data';
import { GroupedDiffs } from '@useoptic/openapi-utilities/build/openapi3/group-diff';

const getChecksLabel = (
  results: CiRunDetails['completed'][number]['comparison']['results'],
  severity: Severity
) => {
  let totalChecks = results.length;
  let failingChecks = 0;
  let exemptedFailingChecks = 0;

  for (const result of results) {
    if (result.passed) continue;
    if (result.severity < severity) continue;
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

function getOperationsText(
  groupedDiffs: GroupedDiffs,
  options: { webUrl?: string | null; verbose: boolean }
) {
  const ops = getOperationsChanged(groupedDiffs);

  const operationsText = options.verbose
    ? [
        ...[...ops.added].map((o) => `\`${o}\` (added)`),
        ...[...ops.changed].map((o) => `\`${o}\` (changed)`),
        ...[...ops.removed].map((o) => `\`${o}\` (removed)`),
      ].join('\n')
    : '';
  return `${getOperationsChangedLabel(groupedDiffs)} ${
    options.webUrl
      ? `([view changelog](${options.webUrl}))`
      : '([setup changelog](https://useoptic.com/docs/cloud-get-started))'
  }

  ${operationsText}
`;
}

export const generateCompareSummaryMarkdown = (
  commit: { sha: string },
  results: CiRunDetails,
  options: { verbose: boolean }
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

${s.apiName} ${
        s.specUrl
          ? `([preview](${s.specUrl}))`
          : '([setup preview](https://useoptic.com/docs/cloud-get-started))'
      }

</td>
<td>

${getOperationsText(s.comparison.groupedDiffs, {
  webUrl: s.opticWebUrl,
  verbose: options.verbose,
})}

</td>
<td>

${getChecksLabel(s.comparison.results, results.severity)}

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
