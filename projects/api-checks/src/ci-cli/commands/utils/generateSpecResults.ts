import { ParseOpenAPIResult, sourcemapReader } from '@useoptic/openapi-io';
import {
  factsToChangelog,
  IChange,
  ResultWithSourcemap,
  ChangeType,
  OpenAPIV3,
  IFact,
  OpenAPITraverser,
} from '@useoptic/openapi-utilities';
import { RuleRunner } from '../../../types';

const packageJson = require('../../../../package.json');

const traverseSpec = (jsonSpec: OpenAPIV3.Document): IFact[] => {
  const currentTraverser = new OpenAPITraverser();

  currentTraverser.traverse(jsonSpec);

  return [...currentTraverser.facts()];
};

export const generateSpecResults = async (
  checkService: RuleRunner,
  from: ParseOpenAPIResult & { isEmptySpec: boolean },
  to: ParseOpenAPIResult & { isEmptySpec: boolean },
  context: any
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

  // TODO RA-V2 - remove the await from checkservice running
  const results = await checkService.runRulesWithFacts({
    currentJsonLike: fromJsonLike,
    nextJsonLike: toJsonLike,
    currentFacts: currentFacts,
    nextFacts: nextFacts,
    changelog: changes,
    context,
  });

  const resultsWithSourcemap = await Promise.all(
    results.map(async (result) => {
      return {
        ...result,
        // TODO RA-V2 - don't redo sourcemap generation
        // Ok this is stupid that we need to recalculate the change - but there's some code somewhere stripping out the change.sourcemap
        // and I can't figure out where - it's also really concerning that we're allowing user run code to strip our functional code here
        sourcemap: await findFileAndLinesFromAfter(
          result.change.location.jsonPath
        ),
      };
    })
  );
  return {
    changes: changesWithSourcemap,
    results: resultsWithSourcemap,
    version: packageJson.version,
  };
};
