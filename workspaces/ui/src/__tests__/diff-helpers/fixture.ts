import { makeUniverse } from './universes/makeUniverse';
import { DiffSet } from '../../engine/diff-set';
import { ParsedDiff } from '../../engine/parse-diff';
import path from 'path';
import { DiffRfcBaseState } from '../../engine/interfaces/diff-rfc-base-state';
import {
  ExampleCaptureService,
  ExampleDiffService,
} from '../../services/diff/ExampleDiffService';
import { IShapeTrail } from '../../engine/interfaces/shape-trail';
import { IDiffSuggestionPreview } from '../../engine/interpretors/interpretor-types/interpretation';
import { prepareShapeDiffSuggestionPreview } from '../../engine/interpretors/prepare-diff-previews';
interface ITestUniverse {
  rfcBaseState: DiffRfcBaseState;
  diffs: DiffSet;
  diffService: ExampleDiffService;
  captureService: ExampleCaptureService;
}

export async function loadsDiffsFromUniverse(
  path: string
): Promise<ITestUniverse> {
  const universe_raw = require(path);
  const universePromise = makeUniverse(universe_raw);
  const { captureService, diffService, rfcBaseState } = await universePromise;
  const diffsRaw = (await diffService.listDiffs()).rawDiffs;

  const diffs = new DiffSet(
    diffsRaw.map(([diff, interactions]) => {
      const diffParsed = new ParsedDiff(diff, interactions);
      return diffParsed;
    }),
    rfcBaseState
  );

  return {
    diffs,
    captureService,
    diffService,
    rfcBaseState,
  };
}

export const testCase = (basePath: string) => async (
  name: string
): Promise<ITestUniverse> => {
  return await loadsDiffsFromUniverse(
    path.join(__dirname + '/universes', basePath, name + '.json')
  );
};

export async function shapeDiffPreview(
  input: {
    shapeDiffGroupingHash: string;
    shapeTrail: IShapeTrail;
    diffs: ParsedDiff[];
  },
  universe: ITestUniverse
): Promise<IDiffSuggestionPreview> {
  const { pathId, method } = input.diffs[0].location(universe.rfcBaseState);

  const trailValues = await universe.diffService.learnTrailValues(
    universe.rfcBaseState.rfcService,
    universe.rfcBaseState.rfcId,
    pathId,
    method,
    input.diffs[0]!.raw()
  );
  return await prepareShapeDiffSuggestionPreview(
    input.diffs[0],
    universe,
    trailValues
  );
}
