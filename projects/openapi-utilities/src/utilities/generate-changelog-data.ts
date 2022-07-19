import { groupChanges } from './group-changes';
import { OpenAPIV3 } from 'openapi-types';
import { traverseSpec } from './traverse-spec';
import { IChange } from '../openapi3/sdk/types';

/**
 * Takes raw outputs form a run and generates the data required to display a changelog.
 */
export const generateChangelogData = ({
  changes,
  toFile,
}: {
  changes: IChange[];
  toFile: OpenAPIV3.Document;
}) => {
  const toFacts = traverseSpec(toFile);
  return groupChanges({ toFacts, changes });
};
