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
    exemptedFailingChecks > 0 ? `, ${exemptedFailingChecks} exempted` : '';

  return failingChecks > 0
    ? `⚠️ **${failingChecks}**/**${totalChecks}** failed${exemptedChunk}`
    : totalChecks > 0
      ? `✅ **${totalChecks}** passed${exemptedChunk}`
      : `ℹ️ No automated checks have run`;
};

export const COMPARE_SUMMARY_IDENTIFIER = `optic-comment-3UsoJCz_Z0SpGLo5Vjw6o`;

function getOperationsText(
  groupedDiffs: GroupedDiffs,
  options: { webUrl?: string | null; verbose: boolean; labelJoiner?: string }
) {
  const ops = getOperationsChanged(groupedDiffs);

  const operationsText = options.verbose
    ? [
        ...[...ops.added].map((o) => `\`${o}\` (added)`),
        ...[...ops.changed].map((o) => `\`${o}\` (changed)`),
        ...[...ops.removed].map((o) => `\`${o}\` (removed)`),
      ].join('\n')
    : '';
  return `${getOperationsChangedLabel(groupedDiffs, {
    joiner: options.labelJoiner,
  })}

  ${operationsText}
`;
}

const getCaptureIssuesLabel = ({
  unmatchedInteractions,
  mismatchedEndpoints,
}: {
  unmatchedInteractions: number;
  mismatchedEndpoints: number;
}) => {
  return [
    ...(unmatchedInteractions
      ? [
          `🆕 ${unmatchedInteractions} undocumented path${
            unmatchedInteractions > 1 ? 's' : ''
          }`,
        ]
      : []),
    ...(mismatchedEndpoints
      ? [
          `⚠️  ${mismatchedEndpoints} mismatch${
            mismatchedEndpoints > 1 ? 'es' : ''
          }`,
        ]
      : []),
  ].join('\n');
};

export const generateCompareSummaryMarkdown = (
  commit: { sha: string },
  results: CiRunDetails,
  options: { verbose: boolean; overrideUrl?: string }
) => {
  const anyCompletedHasWarning = results.completed.some(
    (s) => s.warnings.length > 0
  );
  const anyCompletedHasCapture = results.completed.some((s) => s.capture);
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
<th>Changes</th>
<th>Rules</th>
${anyCompletedHasWarning ? '<th>Warnings</th>' : ''}
${anyCompletedHasCapture ? '<th>Tests</th>' : ''}
<th></th>
</tr>
</thead>
<tbody>
${results.completed
  .map(
    (s) =>
      `<tr>
<td>

${s.apiName}

</td>
<td>

${getOperationsText(s.comparison.groupedDiffs, {
  webUrl: options.overrideUrl || s.opticWebUrl,
  verbose: options.verbose,
  labelJoiner: ',\n',
})}

</td>
<td>

${getChecksLabel(s.comparison.results, results.severity)}

</td>

${anyCompletedHasWarning ? `<td>${s.warnings.join('\n')}</td>` : ''}

${
  anyCompletedHasCapture
    ? `

<td>

${
  s.capture
    ? s.capture.success
      ? s.capture.mismatchedEndpoints || s.capture.unmatchedInteractions
        ? getCaptureIssuesLabel({
            unmatchedInteractions: s.capture.unmatchedInteractions,
            mismatchedEndpoints: s.capture.mismatchedEndpoints,
          })
        : `✅ ${s.capture.percentCovered}% coverage`
      : '❌ Failed to run'
    : ''
}

</td>

`
    : ''
}

<td>

${options.overrideUrl || s.opticWebUrl ? `[View report](${options.overrideUrl || s.opticWebUrl})` : ''}

</td>
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
