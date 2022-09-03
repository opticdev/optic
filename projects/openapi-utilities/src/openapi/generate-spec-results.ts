import { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { factsToChangelog } from './sdk/facts-to-changelog';
import { IChange, ChangeType, IFact } from './sdk/types';
import { OpenAPI3Traverser } from './openapi3/openapi-3-traverser';
import { ResultWithSourcemap } from '../types';
import {
  FileWithSerializedSourcemap,
  RuleRunner,
  SpectralInput,
} from './types';
import { sourcemapReader } from './sourcemap-reader';
import { checkOpenAPIVersion } from './openapi-versions';
import { OpenAPI2Traverser } from './openapi2/openapi-2-traverser';

const packageJson = require('../../package.json');

const traverseSpec = (jsonSpec: OpenAPI.Document): IFact[] => {

  const version = checkOpenAPIVersion(jsonSpec)

  switch (version) {
    case '3.0.x':
    case '3.1.x':
      const traverser = new OpenAPI3Traverser();
      traverser.traverse(jsonSpec as OpenAPIV3.Document);
      return [...traverser.facts()];
    case '2.0.x':
      const currentTraverser = new OpenAPI2Traverser();
      currentTraverser.traverse(jsonSpec as OpenAPIV2.Document);
      return [...currentTraverser.facts()];
  }
};

export const generateSpecResults = async (
  checkService: RuleRunner,
  from: FileWithSerializedSourcemap & { isEmptySpec: boolean },
  to: FileWithSerializedSourcemap & { isEmptySpec: boolean },
  context: any,
  spectralConfig?: SpectralInput
): Promise<{
  changes: IChange[];
  results: ResultWithSourcemap[];
  version: string;
}> => {
  const fromJsonLike = from.jsonLike;
  const toJsonLike = to.jsonLike;
  // If we have an empty spec, the facts should be [] - we keep the jsonLike values
  // in order to have a standard typing - we mainly use facts here to make assertions
  const currentFacts = from.isEmptySpec ? [] : traverseSpec(fromJsonLike);
  const nextFacts = to.isEmptySpec ? [] : traverseSpec(toJsonLike);

  const { findFileAndLines: findFileAndLinesFromBefore } = sourcemapReader(
    from.sourcemap
  );
  const { findFileAndLines: findFileAndLinesFromAfter } = sourcemapReader(
    to.sourcemap
  );

  const changes = factsToChangelog(currentFacts, nextFacts);
  const changesWithSourcemap: IChange[] = await Promise.all(
    changes.map(async (change: IChange): Promise<IChange> => {
      return {
        ...change,
        location: {
          ...change.location,
          sourcemap:
            change.changeType === ChangeType.Removed
              ? await findFileAndLinesFromBefore(change.location.jsonPath)
              : await findFileAndLinesFromAfter(change.location.jsonPath),
        },
      } as IChange;
    })
  );

  const spectralResults =
    spectralConfig && checkService.runSpectralRules
      ? await checkService.runSpectralRules({
          ruleset: spectralConfig,
          nextJsonLike: toJsonLike,
          nextFacts: nextFacts,
        })
      : [];

  const ruleResults = checkService.runRulesWithFacts({
    currentJsonLike: fromJsonLike,
    nextJsonLike: toJsonLike,
    currentFacts: currentFacts,
    nextFacts: nextFacts,
    changelog: changes,
    context,
  });

  const results = [...spectralResults, ...ruleResults];

  const resultsWithSourcemap = await Promise.all(
    results.map(async (result) => {
      return {
        ...result,
        sourcemap:
          (result.change as any).changeType === ChangeType.Removed
            ? await findFileAndLinesFromBefore(result.change.location.jsonPath)
            : await findFileAndLinesFromAfter(result.change.location.jsonPath),
      };
    })
  );
  return {
    changes: changesWithSourcemap,
    results: resultsWithSourcemap,
    version: packageJson.version,
  };
};
