import { BodyShapeDiff, ParsedDiff } from './parse-diff';
import groupby from 'lodash.groupby';
import { IShapeTrail } from './interfaces/shape-trail';
import { diff } from 'react-ace';
import { DiffRfcBaseState } from './interfaces/diff-rfc-base-state';

export class DiffSet {
  constructor(
    private diffs: ParsedDiff[],
    private rfcBaseState: DiffRfcBaseState
  ) {}

  count(): number {
    return this.diffs.length;
  }

  forEndpoint(pathId: string, method: string): DiffSet {
    return new DiffSet(
      this.diffs.filter(
        (i) =>
          i.location(this.rfcBaseState).pathId === pathId &&
          i.location(this.rfcBaseState).method === method
      ),
      this.rfcBaseState
    );
  }
  newRegions(): DiffSet {
    return new DiffSet(
      this.diffs.filter((i) => !Boolean(i.asShapeDiff(this.rfcBaseState))),
      this.rfcBaseState
    );
  }
  shapeDiffs(): DiffSet {
    return new DiffSet(
      this.diffs.filter((i) => Boolean(i.asShapeDiff(this.rfcBaseState))),
      this.rfcBaseState
    );
  }

  groupedByEndpoint(): {
    pathId: string;
    method: string;
    diffs: ParsedDiff[];
  }[] {
    const groupedByEndpoint: { [key: string]: ParsedDiff[] } = groupby(
      this.diffs,
      (d) => {
        const { pathId, method } = d.location(this.rfcBaseState);
        return `${method}.${pathId}`;
      }
    );

    return Object.entries(groupedByEndpoint).map(([key, diffs]) => {
      const { pathId, method } = diffs[0].location(this.rfcBaseState);
      return { pathId, method, diffs };
    });
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
        return i.asShapeDiff(this.rfcBaseState)!.shapeDiffGroupingHash;
      }
    );

    return Object.entries(groupedByShapeTrailHash).map(([key, diffs]) => {
      const oneDiff = diffs[0]!.asShapeDiff(this.rfcBaseState);
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
