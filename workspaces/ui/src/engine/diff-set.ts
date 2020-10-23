import { BodyShapeDiff, ParsedDiff } from './parse-diff';
import groupby from 'lodash.groupby';
import { IShapeTrail } from './interfaces/shape-trail';
import { diff } from 'react-ace';

export class DiffSet {
  constructor(private diffs: ParsedDiff[]) {}

  count(): number {
    return this.diffs.length;
  }

  forEndpoint(pathId: string, method: string): DiffSet {
    return new DiffSet(
      this.diffs.filter(
        (i) => i.location().pathId === pathId && i.location().method === method
      )
    );
  }
  newRegions(): DiffSet {
    return new DiffSet(this.diffs.filter((i) => !Boolean(i.asShapeDiff())));
  }
  shapeDiffs(): DiffSet {
    return new DiffSet(this.diffs.filter((i) => Boolean(i.asShapeDiff())));
  }

  groupedByEndpointAndShapeTrail(): {
    shapeDiffGroupingHash: string;
    shapeTrail: IShapeTrail;
    diffs: ParsedDiff[];
  }[] {
    const groupedByShapeTrailHash: { [key: string]: ParsedDiff[] } = groupby(
      this.shapeDiffs().iterator(),
      (i) => {
        // console.warn('make this look at endpoint too');
        return i.asShapeDiff()!.shapeDiffGroupingHash;
      }
    );

    return Object.entries(groupedByShapeTrailHash).map(([key, diffs]) => {
      const oneDiff = diffs[0]!.asShapeDiff();
      return {
        shapeDiffGroupingHash: key,
        shapeTrail: oneDiff.shapeTrail,
        jsonTrail: oneDiff.jsonTrail,
        diffs,
      };
    });
  }

  iterator(): ParsedDiff[] {
    return this.diffs;
  }
}
