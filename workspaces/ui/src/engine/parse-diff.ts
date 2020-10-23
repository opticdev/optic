import {
  IDiff,
  IDiffWithShapeDiff,
  IShapeDiffResult,
} from './interfaces/diffs';
import jsonStringify from 'json-stable-stringify';
import sha1 from 'node-sha1';
import {
  allowedDiffTypes,
  allowedDiffTypesKeys,
  DiffInRequest,
  DiffInResponse,
  IParsedLocation,
  isBodyShapeDiff,
} from './interfaces/interfaces';
import invariant from 'invariant';
import { IShapeTrail } from './interfaces/shape-trail';
import { IInteractionTrail } from './interfaces/interaction-trail';
import { DiffRfcBaseState } from './interfaces/diff-rfc-base-state';
import { locationForTrails } from './interfaces/trail-parsers';
import { IRequestSpecTrail } from './interfaces/request-spec-trail';
import { IJsonTrail } from '@useoptic/cli-shared/build/diffs/json-trail';

export class ParsedDiff {
  diffType: string;

  constructor(
    private serialized_diff: IDiff,
    public interactions: string[],
    private rfcBaseState: DiffRfcBaseState
  ) {
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

  interactionTrail(): IInteractionTrail {
    const key = Object.keys(this.serialized_diff)[0];
    return this.serialized_diff[key].interactionTrail;
  }

  requestsTrail(): IRequestSpecTrail {
    const key = Object.keys(this.serialized_diff)[0];
    return this.serialized_diff[key].requestsTrail;
  }

  location(): IParsedLocation {
    const location = locationForTrails(
      this.requestsTrail(),
      this.interactionTrail(),
      this.rfcBaseState
    );

    invariant(
      Boolean(location.pathId),
      'Diffs handled by the UI should have a known endpoint'
    );

    return {
      pathId: location!.pathId,
      method: location!.method,
      inRequest: DiffInRequest(this.diffType) && {
        contentType: location.contentType,
      },
      inResponse: DiffInResponse(this.diffType) && {
        statusCode: location.statusCode!,
        contentType: location.contentType,
      },
    };
  }

  isNewRegionDiff(): boolean {
    return !isBodyShapeDiff(this.diffType);
  }
  isBodyShapeDiff(): boolean {
    return isBodyShapeDiff(this.diffType);
  }

  isA(k: string): boolean {
    return this.diffType === k;
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
        ?.shapeDiffResult;

    return new BodyShapeDiff(
      this,
      this.serialized_diff,
      (requestBodyShapeDiff || responseBodyShapeDiff)!,
      this.interactions,
      this.location()
    );
  }
}

export function parseDiffsArray(
  array: [IDiff, string[]][],
  rfcBaseState: DiffRfcBaseState
): ParsedDiff[] {
  return array.map(
    ([rawDiff, pointers]) => new ParsedDiff(rawDiff, pointers, rfcBaseState)
  );
}

export class BodyShapeDiff {
  shapeTrail: IShapeTrail;
  jsonTrail: IJsonTrail;
  shapeDiffGroupingHash: string;
  isUnmatched: boolean;
  isUnspecified: boolean;

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
    this.jsonTrail = (shapeDiff['UnmatchedShape']?.jsonTrail ||
      shapeDiff['UnspecifiedShape']?.jsonTrail)!;

    this.shapeDiffGroupingHash = sha1(
      jsonStringify(this.shapeTrail),
      jsonStringify(this.jsonTrail)
    );

    this.isUnmatched = Boolean(shapeDiff['UnmatchedShape']);
    this.isUnspecified = Boolean(shapeDiff['UnspecifiedShape']);
  }
}
