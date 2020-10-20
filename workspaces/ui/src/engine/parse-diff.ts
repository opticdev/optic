import {
  IDiff,
  IDiffWithShapeDiff,
  IShapeDiffResult,
  IUnmatchedRequestBodyShape,
  IUnmatchedResponseBodyShape,
} from './interfaces/diffs';
import jsonStringify from 'json-stable-stringify';
import sha1 from 'node-sha1';
import {
  allowedDiffTypes,
  allowedDiffTypesKeys,
  DiffInRequest,
  IParsedLocation,
  IRequestBodyLocation,
  IResponseBodyLocation,
  isBodyShapeDiff,
} from './interfaces/interfaces';
import invariant from 'invariant';
import { IShapeTrail } from './interfaces/shape-trail';

export class ParsedDiff {
  diffType: string;

  constructor(private serialized_diff: IDiff, private interactions: string[]) {
    const keys = Object.keys(this.serialized_diff);
    const typeKey = keys[0]!;
    invariant(
      keys.length === 1 && allowedDiffTypesKeys.includes(typeKey),
      'Serialized diffs should only have one root key'
    );

    this.diffType = typeKey!;
  }

  raw(): IDiff {
    return this.serialized_diff;
  }

  location(): IParsedLocation {
    return {
      pathId: 'xyz',
      method: 'GET',
      inRequest: DiffInRequest(this.diffType) && null,
      inResponse: DiffInRequest(this.diffType) && null,
    };
  }

  asShapeDiff(): BodyShapeDiff | undefined {
    if (!isBodyShapeDiff(this.diffType)) {
      return undefined;
    }

    const asWithShapeDiff = this.serialized_diff as IDiffWithShapeDiff;

    const requestBodyShapeDiff: IShapeDiffResult | undefined =
      asWithShapeDiff[allowedDiffTypes.UnmatchedRequestBodyShape.asString]
        ?.shapeDiffResult;

    const responseBodyShapeDiff: IShapeDiffResult | undefined =
      asWithShapeDiff[allowedDiffTypes.UnmatchedResponseBodyShape.asString]
        .shapeDiffResult;

    return new BodyShapeDiff(
      this,
      this.serialized_diff,
      (requestBodyShapeDiff || responseBodyShapeDiff)!,
      this.interactions,
      this.location()
    );
  }
}

export function parseDiffsArray(array: [IDiff, string[]][]): ParsedDiff[] {
  return array.map(([rawDiff, pointers]) => new ParsedDiff(rawDiff, pointers));
}

class BodyShapeDiff {
  shapeTrail: IShapeTrail;
  shapeTrailHash: string;

  constructor(
    private parsedDiff: ParsedDiff,
    private diff: IDiff,
    private shapeDiff: IShapeDiffResult,
    public interactionPointers: string[],
    public location: IParsedLocation
  ) {
    this.shapeTrail = (shapeDiff['UnmatchedShape']?.shapeTrail ||
      shapeDiff['UnspecifiedShape']?.shapeTrail)!;
    invariant(
      this.shapeTrail,
      'A shape trail must be specified with all shape diffs'
    );
    this.shapeTrailHash = sha1(jsonStringify(this.shapeTrail));
  }
}
