import { groupChangesAndRules } from './group-changes';
import { OpenAPIV3 } from 'openapi-types';
import { traverseSpec } from './traverse-spec';
import { IChange } from '../openapi/sdk/types';
import { ResultWithSourcemap } from '../types';

/**
 * Takes raw outputs form a run and generates the data required to display a changelog.
 *
 * @example
 * generateChangelogData({ changes: compareOutput.changes, toFile: parsedTo.jsonLike});
 */
export const generateChangelogData = ({
  changes,
  toFile,
  rules,
}: {
  changes: IChange[];
  toFile: OpenAPIV3.Document;
  rules: ResultWithSourcemap[];
}) => {
  const toFacts = traverseSpec(toFile);
  return groupChangesAndRules({ toFacts, changes, rules });
};
