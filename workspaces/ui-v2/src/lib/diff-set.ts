import { ParsedDiff } from './parse-diff';
import groupby from 'lodash.groupby';
import { DiffTypes } from '@useoptic/cli-shared/build/diffs/diffs';
import {
  IShapeTrail,
  normalizeShapeTrail,
} from '@useoptic/cli-shared/build/diffs/shape-trail';
import { CurrentSpecContext, isDiffForKnownEndpoint } from './Interfaces';

export class DiffSet {
  constructor(
    private diffs: ParsedDiff[],
    private currentSpecContext: CurrentSpecContext
  ) {}

  count(): number {
    return this.diffs.length;
  }

  forEndpoint(pathId: string, method: string): DiffSet {
    return new DiffSet(
      this.diffs.filter(
        (i) =>
          i.location(this.currentSpecContext).pathId === pathId &&
          i.location(this.currentSpecContext).method === method
      ),
      this.currentSpecContext
    );
  }
  newRegions(): DiffSet {
    return new DiffSet(
      this.diffs.filter(
        (i) => !Boolean(i.asShapeDiff(this.currentSpecContext))
      ),
      this.currentSpecContext
    );
  }
  shapeDiffs(): DiffSet {
    return new DiffSet(
      this.diffs.filter((i) => Boolean(i.asShapeDiff(this.currentSpecContext))),
      this.currentSpecContext
    );
  }

  forKnownEndpoint(): DiffSet {
    return new DiffSet(
      this.diffs.filter((i) => {
        return (
          isDiffForKnownEndpoint(i.diffType) &&
          i.affectsADocumentedEndpoint(this.currentSpecContext)
        );
      }),
      this.currentSpecContext
    );
  }

  forUndocumented(): DiffSet {
    return new DiffSet(
      this.diffs.filter((i) => {
        return (
          [
            DiffTypes.UnmatchedRequestBodyContentType,
            DiffTypes.UnmatchedResponseStatusCode,
            DiffTypes.UnmatchedResponseBodyContentType,
          ].includes(i.diffType) &&
          !i.affectsADocumentedEndpoint(this.currentSpecContext)
        );
      }),
      this.currentSpecContext
    );
  }

  groupedByEndpoint(): {
    pathId: string;
    method: string;
    diffs: ParsedDiff[];
  }[] {
    const forEndpoints = this.forKnownEndpoint().iterator();

    const groupedByEndpoint: { [key: string]: ParsedDiff[] } = groupby(
      forEndpoints,
      (d) => {
        const { pathId, method } = d.location(this.currentSpecContext);
        return `${method}.${pathId}`;
      }
    );

    const result = Object.entries(groupedByEndpoint).map(([key, diffs]) => {
      const { pathId, method } = diffs[0].location(this.currentSpecContext);
      return { pathId, method, diffs };
    });

    return result.filter((i) => i.pathId !== 'root');
  }

  // filterToValidExpectations(): DiffSet {
  //   return new DiffSet(
  //     this.diffs.filter((i) => {
  //       const hasExpectation = expectationsFromSpecOption(
  //         i,
  //         this.rfcBaseState,
  //         i.asShapeDiff(this.rfcBaseState).shapeTrail,
  //         i.asShapeDiff(this.rfcBaseState).jsonTrail
  //       );
  //
  //       if (!hasExpectation) {
  //         console.error('expectation error, hiding diff ', {
  //           diff: i.raw(),
  //         });
  //       }
  //       return hasExpectation;
  //     }),
  //     this.rfcBaseState
  //   );
  // }

  groupedByEndpointAndShapeTrail(): {
    shapeDiffGroupingHash: string;
    shapeTrail: IShapeTrail;
    diffs: ParsedDiff[];
  }[] {
    const groupedByShapeTrailHash: { [key: string]: ParsedDiff[] } = groupby(
      this.shapeDiffs().iterator(),
      (i) => {
        // console.warn('make this look at endpoint too');
        return i.asShapeDiff(this.currentSpecContext)!.shapeDiffGroupingHash;
      }
    );

    return Object.entries(groupedByShapeTrailHash).map(([key, diffs]) => {
      const oneDiff = diffs[0]!.asShapeDiff(this.currentSpecContext);
      return {
        shapeDiffGroupingHash: key,
        shapeTrail: normalizeShapeTrail(oneDiff!.shapeTrail),
        jsonTrail: oneDiff!.jsonTrail,
        diffs,
      };
    });
  }

  iterator(): ParsedDiff[] {
    return this.diffs;
  }
}
