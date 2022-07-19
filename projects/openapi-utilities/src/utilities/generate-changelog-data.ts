import { groupChanges } from './group-changes';
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
  const toFacts = traverseSpec(toFile);
  return groupChanges({ toFacts, changes });
};
