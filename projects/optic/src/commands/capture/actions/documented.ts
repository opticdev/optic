import { ParseResult } from '../../../utils/spec-loaders';
import {
  generateEndpointSpecPatches,
  jsonOpsFromSpecPatches,
} from '../patches/patches';

import { CapturedInteractions } from '../sources/captured-interactions';
import { ApiCoverageCounter } from '../coverage/api-coverage';
import * as AT from '../../oas/lib/async-tools';
import { writePatchesToFiles } from '../write/file';

import { UnpatchableDiff } from '../patches/patchers/shapes/diff';
import { SpecPatch } from '../patches/patchers/spec/patches';
import {
  EndpointPatchSummaries,
  GroupedUnpatchableDiff,
} from '../patches/summaries';

// Groups together diffs that are triggered from the same schema instance (we could have multiple interactions or array items that trigger a custom schema error)
// The reason we need to group these diffs and not the patches, is because once a patchable diff is hit the in-memory spec used to continue diffing never generates the second diff.
// In the case of unpatchable diffs, we get all interactions that would have caused this issue
async function groupUnpatchableDiffs(
  collectedPatches: (SpecPatch | UnpatchableDiff)[]
): Promise<AsyncIterable<SpecPatch | GroupedUnpatchableDiff>> {
  const patchesOrGroupedDiffs: (SpecPatch | GroupedUnpatchableDiff)[] = [];
  const relatedErrorToIdx = new Map<string, number>();

  for (let i = 0; i < collectedPatches.length; i++) {
    const patchOrDiff = collectedPatches[i];
    if ('unpatchable' in patchOrDiff) {
      const errorId = `${patchOrDiff.validationError.schemaPath}${patchOrDiff.validationError.keyword}`;
      const relatedIdx = relatedErrorToIdx.get(errorId);
      if (typeof relatedIdx === 'number') {
        const relatedDiff = patchesOrGroupedDiffs[relatedIdx];
        if ('unpatchable' in relatedDiff) {
          relatedDiff.examples.push(patchOrDiff.example);
        } else {
          throw new Error('Invalid index for patchesOrGroupedDiffs');
        }
      } else {
        relatedErrorToIdx.set(errorId, patchesOrGroupedDiffs.length);
        const { example, ...withoutExample } = patchOrDiff;
        patchesOrGroupedDiffs.push({
          ...withoutExample,
          examples: [example],
        });
      }
    } else {
      patchesOrGroupedDiffs.push(patchOrDiff);
    }
  }

  return (async function* () {
    for (const patchOrDiff of patchesOrGroupedDiffs) {
      yield patchOrDiff;
    }
  })();
}

export async function diffExistingEndpoint(
  interactions: CapturedInteractions,
  parseResult: Exclude<ParseResult, { version: '2.x.x' }>,
  coverage: ApiCoverageCounter,
  endpoint: {
    path: string;
    method: string;
  },
  options: {
    update?: 'documented' | 'interactive' | 'automatic';
    verbose: boolean;
  }
) {
  const patchSummaries = new EndpointPatchSummaries(parseResult, options);
  function addPatchSummary(patchOrDiff: SpecPatch | GroupedUnpatchableDiff) {
    coverage.shapeDiff(patchOrDiff);
    patchSummaries.addPatch(patchOrDiff);
  }
  const groupedDiffs = await groupUnpatchableDiffs(
    await AT.collect(
      generateEndpointSpecPatches(
        interactions,
        { spec: parseResult.jsonLike },
        endpoint,
        { coverage }
      )
    )
  );

  const specPatches: AsyncIterable<SpecPatch> = AT.filter(
    (patchOrDiff: SpecPatch | GroupedUnpatchableDiff) => {
      return !('unpatchable' in patchOrDiff);
    }
  )(AT.tap(addPatchSummary)(groupedDiffs)) as AsyncIterable<SpecPatch>;

  if (options.update) {
    const operations = await jsonOpsFromSpecPatches(specPatches);
    await writePatchesToFiles(operations, parseResult.sourcemap);
  } else {
    for await (const _ of specPatches) {
    }
  }

  const summaries = patchSummaries.getPatchSummaries();

  return { patchSummaries: summaries, hasDiffs: summaries.length > 0 };
}
