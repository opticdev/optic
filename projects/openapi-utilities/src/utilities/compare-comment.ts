import { CompareFileJson } from '../ci-types';
import { OPTIC_COMMENT_SURVEY_LINK } from './shared-comment';
import { getOperationsModifsLabel } from './count-changed-operations';

type SessionItem = {
  apiName: string;
  compareFile: CompareFileJson;
  opticWebUrl: string;
  run: number;
};

const footer = `------
  How can Optic be improved? Leave your feedback [here](${OPTIC_COMMENT_SURVEY_LINK})`;

const getCommentHeader = (hash: string) =>
  `<!-- DO NOT MODIFY - OPTIC IDENTIFIER: ${hash} -->`;

const getChecksLabel = (results: CompareFileJson['results']) => {
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
    ? `⚠️ **${failingChecks}** / **${totalChecks}** checks failed.${exemptedChunk}`
    : totalChecks > 0
    ? `✅ all checks passed (**${totalChecks}**)${exemptedChunk}`
    : `ℹ️ No automated checks have run`;
};

const getSessionBody = (
  name: string,
  results: CompareFileJson['results'],
  changes: CompareFileJson['changes'],
  opticWebUrl: string
) => {
  const operationsModifsLabel = getOperationsModifsLabel(changes);
  return `- ${name} [(view changelog)](${opticWebUrl}) ${operationsModifsLabel} ${getChecksLabel(
    results
  )}.`;
};

export const createMultiSessionsCommentBody = (
  commit_hash: string,
  compareHash: string,
  sessions: SessionItem[]
) => `${getCommentHeader(compareHash)}
### APIs Changed

${sessions
  .map((s) =>
    getSessionBody(
      s.apiName,
      s.compareFile.results,
      s.compareFile.changes,
      s.opticWebUrl
    )
  )
  .join('\n')}

Summary of check results (${commit_hash}).

${footer}
`;

export const createCommentBody = (
  results: CompareFileJson['results'],
  changes: CompareFileJson['changes'],
  compareHash: string,
  commit_hash: string,
  run: number,
  opticWebUrl: string
) =>
  createMultiSessionsCommentBody(commit_hash, compareHash, [
    {
      apiName: '',
      compareFile: { changes, results },
      opticWebUrl,
      run,
    },
  ]);
