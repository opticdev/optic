import jsonStringify from 'json-stable-stringify';
//@ts-ignore
import sha1 from 'node-sha1';
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

import {
  IShapeTrail,
  normalizeShapeTrail,
} from '@useoptic/cli-shared/build/diffs/shape-trail';
import {
  allowedDiffTypes,
  allowedDiffTypesKeys,
  CurrentSpecContext,
  IParsedLocation,
  isBodyShapeDiff,
} from './Interfaces';
import { locationForTrails } from '@useoptic/cli-shared/build/diffs/trail-parsers';

// TODO QPB rewrite ParsedDiff to have better type safety and better utility functions
export class ParsedDiff {
  diffType: string;
  diffHash: string;

  constructor(
    private serialized_diff: IDiff,
    public interactions: string[],
    fingerprint: string
  ) {
    const keys = Object.keys(this.serialized_diff);
    const typeKey = keys[0]!;
    invariant(
      keys.length === 1 && allowedDiffTypesKeys.includes(typeKey),
      'Serialized diffs should only have one root key'
    );

    this.diffHash = fingerprint;

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
    // @ts-ignore
    return this.serialized_diff[key].interactionTrail;
  }

  requestsTrail(): IRequestSpecTrail {
    const key = Object.keys(this.serialized_diff)[0];
    // @ts-ignore
    return this.serialized_diff[key].requestsTrail;
  }

  affectsADocumentedEndpoint(currentSpecContext: CurrentSpecContext) {
    const location = this.location(currentSpecContext);
    if (!location) {
      return false;
    }

    const allEndpoints = currentSpecContext.currentSpecEndpoints;
    const isDocumented = allEndpoints.find(
      (i: any) => i.pathId === location.pathId && i.method === location.method
    );

    return location.pathId && !!isDocumented;
  }

  location(currentSpecContext: CurrentSpecContext): IParsedLocation {
    const location = locationForTrails(
      this.requestsTrail(),
      this.interactionTrail(),
      currentSpecContext.currentSpecEndpoints
    );

    if (!location) {
      throw new Error('no location found for diff');
    }

    return {
      pathId: location.pathId,
      method: location.method,
      descriptor: location.descriptor,
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

  asShapeDiff(
    currentSpecContext: CurrentSpecContext
  ): BodyShapeDiff | undefined {
    if (!isBodyShapeDiff(this.diffType)) {
      return undefined;
    }

    const asWithShapeDiff = this.serialized_diff as IDiffWithShapeDiff;

    const queryParameterBodyShapeDiff: IShapeDiffResult | undefined =
      // @ts-ignore
      asWithShapeDiff[allowedDiffTypes.UnmatchedQueryParametersShape.asString]
        ?.shapeDiffResult;

    const requestBodyShapeDiff: IShapeDiffResult | undefined =
      // @ts-ignore
      asWithShapeDiff[allowedDiffTypes.UnmatchedRequestBodyShape.asString]
        ?.shapeDiffResult;

    const responseBodyShapeDiff: IShapeDiffResult | undefined =
      // @ts-ignore
      asWithShapeDiff[allowedDiffTypes.UnmatchedResponseBodyShape.asString]
        ?.shapeDiffResult;

    return new BodyShapeDiff(
      this,
      this.serialized_diff,
      // TODO QPB - remove the ! here
      (queryParameterBodyShapeDiff ||
        requestBodyShapeDiff ||
        responseBodyShapeDiff)!,
      this.interactions,
      this.location(currentSpecContext)
    );
  }
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
    // @ts-ignore
    this.shapeTrail = (shapeDiff['UnmatchedShape']?.shapeTrail ||
      // @ts-ignore
      shapeDiff['UnspecifiedShape']?.shapeTrail)!;
    invariant(
      this.shapeTrail,
      'A shape trail must be specified with all shape diffs'
    );

    this.normalizedShapeTrail = normalizeShapeTrail(this.shapeTrail);

    this.jsonTrail = normalize(
      // @ts-ignore
      shapeDiff['UnmatchedShape']?.jsonTrail ||
        // @ts-ignore
        shapeDiff['UnspecifiedShape']?.jsonTrail
    )!;

    this.shapeDiffGroupingHash = sha1(
      jsonStringify(normalizeShapeTrail(this.shapeTrail)) +
        jsonStringify(this.jsonTrail)
    );

    // @ts-ignore
    this.isUnmatched = Boolean(shapeDiff['UnmatchedShape']);
    // @ts-ignore
    this.isUnspecified = Boolean(shapeDiff['UnspecifiedShape']);
  }

  diffHash() {
    return this.parsedDiff.diffHash;
  }
}
