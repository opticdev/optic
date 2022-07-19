import { groupChanges } from './group-changes';
import { compareChangesByPath } from './compare-changes-by-path';
import { CompareFileJson } from '../ci-types';
import { OpenAPIV3 } from 'openapi-types';
import { traverseSpec } from './traverse-spec';

/**
 * Takes raw outputs form a run and generates the data required to display a changelog.
 */
export const generateChangelogData = ({
  compareOutput,
  toFile,
}: {
  compareOutput: CompareFileJson;
  toFile: OpenAPIV3.Document;
}) => {
  const { changes } = compareOutput;
  const sortedChanges = changes.sort(compareChangesByPath);
  const toFacts = traverseSpec(toFile);
  return groupChanges({ toFacts, changes: sortedChanges });
};
