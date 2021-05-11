import path from 'path';
import {
  buildUniverse,
  ITestUniverse,
} from '<src>/lib/__tests/diff-helpers/universes/buildUniverse';
import { ParsedDiff } from '<src>/lib/parse-diff';
import { DiffSet } from '<src>/lib/diff-set';
import { interpretShapeDiffs } from '<src>/lib/shape-diffs/shape-diffs';
import { IShapeTrail } from '@useoptic/cli-shared/build/diffs/shape-trail';
import colors from 'colors';
import {
  ICopy,
  ICopyStyle,
} from '<src>/optic-components/diffs/render/ICopyRender';
import { IChangeType, IInterpretation } from '<src>/lib/Interfaces';
import { IValueAffordanceSerializationWithCounter } from '@useoptic/cli-shared/build/diffs/initial-types';
import { newRegionInterpreters } from '<src>/lib/new-regions-interpreter';
import { IOpticDiffService } from '@useoptic/spectacle';

export const testCase = (basePath: string) => async (
  name: string
): Promise<{
  universe: ITestUniverse;
  diffSet: DiffSet;
  diffs: ParsedDiff[];
}> => {
  const universe = await buildUniverse(
    require(path.join(__dirname + '/universes', basePath, name + '.json'))
  );

  const started = await universe.opticContext.capturesService.startDiff(
    '123',
    'example-session'
  );
  await started.onComplete;

  const result = await universe.opticContext.diffRepository.findById('123');
  const diffs = (await result.listDiffs()).diffs;

  const parsedDiffs = diffs.map(
    ([diff, interactions, fingerprint]: any) =>
      new ParsedDiff(diff, interactions, fingerprint)
  );

  return {
    diffs: parsedDiffs,
    diffSet: new DiffSet(parsedDiffs, universe.currentSpecContext),
    universe,
  };
};
export const testCaseLoaded = async (
  example: any
): Promise<{
  universe: ITestUniverse;
  diffSet: DiffSet;
  diffs: ParsedDiff[];
}> => {
  const universe = await buildUniverse(example);

  const started = await universe.opticContext.capturesService.startDiff(
    '123',
    'example-session'
  );
  await started.onComplete;

  const result = await universe.opticContext.diffRepository.findById('123');
  const diffs = (await result.listDiffs()).diffs;

  const parsedDiffs = diffs.map(
    ([diff, interactions, fingerprint]: any) =>
      new ParsedDiff(diff, interactions, fingerprint)
  );

  return {
    diffs: parsedDiffs,
    diffSet: new DiffSet(parsedDiffs, universe.currentSpecContext),
    universe,
  };
};

export type IShapeDiffTestSnapshot = {
  preview: IInterpretation;
  commands: any[];
  trailValues: IValueAffordanceSerializationWithCounter;
};

export async function newRegionPreview(
  diff: ParsedDiff,
  diffService: IOpticDiffService,
  universe: ITestUniverse
) {
  const newRegion = await newRegionInterpreters(
    diff,
    diffService,
    universe.currentSpecContext
  );

  return newRegion;
}

export async function shapeDiffPreview(
  input: {
    shapeDiffGroupingHash: string;
    shapeTrail: IShapeTrail;
    diffs: ParsedDiff[];
  },
  universe: ITestUniverse
): Promise<IShapeDiffTestSnapshot> {
  const { pathId, method } = input.diffs[0].location(
    universe.currentSpecContext
  );

  const diffService = await universe.opticContext.diffRepository.findById(
    '123'
  );
  const shapeAffordances = await diffService.learnShapeDiffAffordances();

  const trailValues = shapeAffordances[input.diffs[0]!.diffHash];

  const preview = await interpretShapeDiffs(
    input.diffs[0].asShapeDiff(universe.currentSpecContext)!,
    trailValues,
    universe.spectacleQuery,
    universe.currentSpecContext
  );

  return {
    preview,
    trailValues,
    commands: [], //preview.toCommands(preview.updateSpecChoices!),
  };
}

export function ICopyToConsole(i: ICopy[]): string {
  return i
    .map((i) =>
      i.style === ICopyStyle.Code ? colors.bgBlue(i.text) : colors.green(i.text)
    )
    .join(' ');
}

export async function logResult(preview: any) {
  const toLog = [];

  toLog.push(
    `DIFF HASH: ${colors.underline(preview.diffDescription.diffHash)}`
  );

  toLog.push(
    `TITLE: ${colors.underline(
      ICopyToConsole(preview.overrideTitle || preview.diffDescription.title)
    )}`
  );

  toLog.push(
    `ASSERTION: ${colors.underline(
      ICopyToConsole(preview.diffDescription.assertion)
    )}`
  );
  toLog.push(
    `CHANGE TYPE: ${colors.underline(
      IChangeType[preview.diffDescription.changeType]
    )}`
  );

  toLog.push('CHOICES:');
  toLog.push('is field ' + preview.updateSpecChoices!.isField);
  toLog.push('is optional ' + preview.updateSpecChoices!.isOptional);
  toLog.push(
    preview
      .updateSpecChoices!.shapes.map(
        (i: any) => `   ${i.coreShapeKind}:${i.isValid}`
      )
      .join('  ')
  );

  console.log(preview.updateSpecChoices!.isField);

  console.log(toLog.join('\n'));
}
