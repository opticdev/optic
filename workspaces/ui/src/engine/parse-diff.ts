import {
  IDiff,
  IDiffWithShapeDiff,
  IShapeDiffResult,
  IUnmatchedRequestBodyShape,
  IUnmatchedResponseBodyShape,
} from './interfaces/diffs';
import {
  allowedDiffTypes,
  allowedDiffTypesKeys,
  DiffInRequest,
  IDiffLocation,
  IParsedLocation,
  IRequestBodyLocation,
  IResponseBodyLocation,
  isBodyShapeDiff,
} from './interfaces/interfaces';
import invariant from 'invariant';

class ParsedDiff {
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

  location(): IParsedLocation {
    return {
      pathId: 'xyz',
      method: 'GET',
      inRequest: DiffInRequest(this.diffType) && null,
      inResponse: DiffInRequest(this.diffType) && null,
    };
  }

  isShapeDiff(): boolean {
    return isBodyShapeDiff(this.diffType);
  }
  isNewRegionDiff(): boolean {
    return !isBodyShapeDiff(this.diffType);
  }

  asShapeDiff(): BodyShapeDiff {
    invariant(this.isShapeDiff(), 'cannot cast as shape diff');
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

class BodyShapeDiff {
  constructor(
    private parsedDiff: ParsedDiff,
    private diff: IDiff,
    private shapeDiff: IShapeDiffResult,
    private interactionPointers: string[],
    private location: IParsedLocation
  ) {}
}
