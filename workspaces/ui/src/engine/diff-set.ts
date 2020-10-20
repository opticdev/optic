import { ParsedDiff } from './parse-diff';

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

  iterator(): ParsedDiff[] {
    return this.diffs;
  }
}
