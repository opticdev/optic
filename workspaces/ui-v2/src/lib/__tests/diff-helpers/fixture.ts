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
import sortby from 'lodash.sortby';
import stringify from 'json-stable-stringify';
import {
  ICopy,
  ICopyStyle,
} from '<src>/optic-components/diffs/render/ICopyRender';
import { IChangeType, IInterpretation } from '<src>/lib/Interfaces';
import { IValueAffordanceSerializationWithCounter } from '@useoptic/cli-shared/build/diffs/initial-types';
import { newRegionInterpreters } from '<src>/lib/new-regions-interpreter';
import { IOpticDiffService } from '@useoptic/spectacle';
import { getExpectationsForShapeTrail } from '<src>/lib/shape-diff-dsl-rust';
import { IExpectationHelper } from '<src>/lib/shape-trail-parser';

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

  // Overwrite the learn_undocumented_bodies to ensure deterministic id generation
  const oldLearnBodies =
    universe.opticContext.opticEngine.learn_undocumented_bodies;
  universe.opticContext.opticEngine.learn_undocumented_bodies = (
    spec,
    interactions_jsonl
  ) => oldLearnBodies(spec, interactions_jsonl, 'sequential');

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

  const commands = newRegion?.toCommands(newRegion?.updateSpecChoices);
  universe.forkSpectacleWithCommands(commands);
  return { newRegion, commands };
}

export async function shapeDiffPreview(
  input: {
    shapeDiffGroupingHash: string;
    shapeTrail: IShapeTrail;
    diffs: ParsedDiff[];
  },
  universe: ITestUniverse
): Promise<{
  preview: IInterpretation;
  trailValues: IValueAffordanceSerializationWithCounter;
  expectations: IExpectationHelper;
  commands: any[];
}> {
  const { pathId, method } = input.diffs[0].location(
    universe.currentSpecContext
  );

  const diffService = await universe.opticContext.diffRepository.findById(
    '123'
  );
  const shapeAffordances = await diffService.learnShapeDiffAffordances();

  const trailValues = shapeAffordances[input.diffs[0]!.diffHash];

  //rust engine guarantees no ordering. make them snapshot friendly
  const sortedTrailValues: IValueAffordanceSerializationWithCounter = {
    affordances: sortby(
      trailValues.affordances.map((i) => ({
        ...i,
        fieldSet: sortby(i.fieldSet, (e) => e.sort()),
      })),
      (e) => stringify(e)
    ),
    interactions: {
      ...trailValues.interactions,
      wasObject: trailValues.interactions.wasObject.sort(),
      wasNumber: trailValues.interactions.wasNumber.sort(),
      wasNull: trailValues.interactions.wasNull.sort(),
      wasBoolean: trailValues.interactions.wasBoolean.sort(),
      wasMissing: trailValues.interactions.wasMissing.sort(),
      wasString: trailValues.interactions.wasString.sort(),
    },
  };

  const preview = await interpretShapeDiffs(
    input.diffs[0].asShapeDiff(universe.currentSpecContext)!,
    trailValues,
    universe.spectacleQuery,
    universe.currentSpecContext
  );

  const expected = await getExpectationsForShapeTrail(
    input.diffs[0].asShapeDiff(universe.currentSpecContext)?.shapeTrail!,
    input.diffs[0].asShapeDiff(universe.currentSpecContext)?.jsonTrail!,
    universe.spectacleQuery,
    universe.currentSpecContext
  );

  const commands = preview.toCommands(preview.updateSpecChoices!);

  await universe.forkSpectacleWithCommands(commands);

  return {
    preview: {
      ...preview,
      previewTabs: sortby(preview.previewTabs, (e) => stringify(e)),
    },
    expectations: expected.expectationsFromSpec,
    trailValues: sortedTrailValues,
    commands,
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

  console.log(toLog.join('\n'));
}
