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
import {
  IJsonTrail,
  normalize,
} from '@useoptic/cli-shared/build/diffs/json-trail';
import {
  IDiff,
  IDiffWithShapeDiff,
  IShapeDiffResult,
} from '@useoptic/cli-shared/build/diffs/diffs';
import { IInteractionTrail } from '@useoptic/cli-shared/build/diffs/interaction-trail';
import { IRequestSpecTrail } from '@useoptic/cli-shared/build/diffs/request-spec-trail';
import { DiffRfcBaseState } from '@useoptic/cli-shared/build/diffs/diff-rfc-base-state';
import { locationForTrails } from '@useoptic/cli-shared/build/diffs/trail-parsers';
import {
  IShapeTrail,
  normalizeShapeTrail,
} from '@useoptic/cli-shared/build/diffs/shape-trail';

export class ParsedDiff {
  diffType: string;
  diffHash: string;

  constructor(private serialized_diff: IDiff, public interactions: string[]) {
    const keys = Object.keys(this.serialized_diff);
    const typeKey = keys[0]!;
    invariant(
      keys.length === 1 && allowedDiffTypesKeys.includes(typeKey),
      'Serialized diffs should only have one root key'
    );

    this.diffHash = sha1(jsonStringify(this.serialized_diff));

    this.diffType = typeKey!;
  }

  toString() {
    return '';
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

  affectsADocumentedEndpoint(rfcBaseState: DiffRfcBaseState) {
    const location = locationForTrails(
      this.requestsTrail(),
      this.interactionTrail(),
      rfcBaseState
    );

    const allEndpoints = rfcBaseState.queries.endpoints();
    const isDocumented = allEndpoints.find(
      (i) => i.pathId === location.pathId && i.method === location.method
    );

    return location && location.pathId && Boolean(isDocumented);
  }

  location(rfcBaseState: DiffRfcBaseState): IParsedLocation {
    const diff = this.serialized_diff;
    const location = locationForTrails(
      this.requestsTrail(),
      this.interactionTrail(),
      rfcBaseState
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
        requestId: location.requestId,
      },
      inResponse: DiffInResponse(this.diffType) && {
        statusCode: location.statusCode!,
        contentType: location.contentType,
        responseId: location.responseId,
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

  asShapeDiff(rfcBaseState: DiffRfcBaseState): BodyShapeDiff | undefined {
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
      this.location(rfcBaseState)
    );
  }
}

export function parseDiffsArray(array: [IDiff, string[]][]): ParsedDiff[] {
  return array.map(([rawDiff, pointers]) => new ParsedDiff(rawDiff, pointers));
}

export class BodyShapeDiff {
  shapeTrail: IShapeTrail;
  normalizedShapeTrail: IShapeTrail;
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

    this.normalizedShapeTrail = normalizeShapeTrail(this.shapeTrail);

    this.jsonTrail = normalize(
      shapeDiff['UnmatchedShape']?.jsonTrail ||
        shapeDiff['UnspecifiedShape']?.jsonTrail
    )!;

    this.shapeDiffGroupingHash = sha1(
      jsonStringify(normalizeShapeTrail(this.shapeTrail)),
      jsonStringify(this.jsonTrail)
    );

    this.isUnmatched = Boolean(shapeDiff['UnmatchedShape']);
    this.isUnspecified = Boolean(shapeDiff['UnspecifiedShape']);
  }

  diffHash() {
    return this.parsedDiff.diffHash;
  }
}
