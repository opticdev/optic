import { CompareFileJson } from '../ci-types';
import { OPTIC_COMMENT_SURVEY_LINK } from './shared-comment';
import { getOperationsModifsLabel } from './count-changed-operations';

const footer = `------
  How can Optic be improved? Leave your feedback [here](${OPTIC_COMMENT_SURVEY_LINK})`;

const getCommentHeader = (hash: string) =>
  `<!-- DO NOT MODIFY - OPTIC IDENTIFIER: ${hash} -->`;

const getCommentBodyInner = (
  name: string,
  results: CompareFileJson['results'],
  changes: CompareFileJson['changes'],
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

  const operationsModifsLabel = getOperationsModifsLabel(changes);

  const exemptedChunk =
    exemptedFailingChecks > 0
      ? ` ${exemptedFailingChecks} would have failed but were exempted.`
      : '';

  const bodyInner = `### New changes to your OpenAPI spec ${name}

  Summary of run [#${run}](${opticWebUrl}) results (${commit_hash}):

  💡 ${operationsModifsLabel}

  ${
    failingChecks > 0
      ? `⚠️ **${failingChecks}** / **${totalChecks}** checks failed.${exemptedChunk}`
      : totalChecks > 0
      ? `✅ all checks passed (**${totalChecks}**).${exemptedChunk}`
      : `ℹ️ No automated checks have run.`
  }

  For details, see [the Optic API Changelog](${opticWebUrl})`;

  return bodyInner;
};

export const createMultiSessionsCommentBody = (
  commit_hash: string,
  compareHash: string,
  sessions: {
    apiName: string;
    compareFile: CompareFileJson;
    opticWebUrl: string;
    run: number;
  }[]
) => {
  const sessionBodies = sessions
    .map((session) =>
      getCommentBodyInner(
        session.apiName,
        session.compareFile.results,
        session.compareFile.changes,
        commit_hash,
        session.run,
        session.opticWebUrl
      )
    )
    .join('\n\n');
  const body = `${getCommentHeader(compareHash)}
${sessionBodies}

${footer}
`;
  return body;
};

export const createCommentBody = (
  results: CompareFileJson['results'],
  changes: CompareFileJson['changes'],
  compareHash: string,
  commit_hash: string,
  run: number,
  opticWebUrl: string
) => {
  return `${getCommentHeader(compareHash)}
${getCommentBodyInner('', results, changes, commit_hash, run, opticWebUrl)}

${footer}
`;
};
