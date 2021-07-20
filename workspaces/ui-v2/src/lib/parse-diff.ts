import jsonStringify from 'json-stable-stringify';
//@ts-ignore
import sha1 from 'node-sha1';
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
  isBodyShapeDiff,
} from './Interfaces';
import {
  locationForTrails,
  LocationDescriptor,
} from '@useoptic/cli-shared/build/diffs/trail-parsers';

export class DiffLocation {
  constructor(
    public pathId: string,
    public method: string,
    private descriptor: LocationDescriptor
  ) {}

  isQueryParameter(): boolean {
    return (
      this.descriptor.type === 'query' || this.descriptor.type === 'path_query'
    );
  }

  isRequest(): boolean {
    return (
      this.descriptor.type === 'request' ||
      this.descriptor.type === 'path_request'
    );
  }

  isResponse(): boolean {
    return (
      this.descriptor.type === 'response' ||
      this.descriptor.type === 'path_response'
    );
  }

  getQueryParametersId(): string | null {
    return this.descriptor.type === 'query'
      ? this.descriptor.queryParametersId
      : null;
  }

  getRequestDescriptor(): {
    requestId?: string; // requestId only lives on descriptor.type === 'request'
    contentType: string;
  } | null {
    if (this.descriptor.type === 'request') {
      return {
        requestId: this.descriptor.requestId,
        contentType: this.descriptor.contentType,
      };
    } else if (this.descriptor.type === 'path_request') {
      return {
        contentType: this.descriptor.contentType,
      };
    } else {
      return null;
    }
  }

  getResponseDescriptor(): {
    responseId?: string; // responseId only lives on descriptor.type === 'responseId'
    contentType?: string; // content type is nullable on path_response ????
    statusCode: number;
  } | null {
    if (this.descriptor.type === 'response') {
      return {
        responseId: this.descriptor.responseId,
        contentType: this.descriptor.contentType,
        statusCode: this.descriptor.statusCode,
      };
    } else if (this.descriptor.type === 'path_response') {
      return {
        contentType: this.descriptor.contentType,
        statusCode: this.descriptor.statusCode,
      };
    } else {
      return null;
    }
  }
}

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
    if (!(keys.length === 1 && allowedDiffTypesKeys.includes(typeKey))) {
      throw new Error('Serialized diffs should only have one root key');
    }

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

  location(currentSpecContext: CurrentSpecContext): DiffLocation {
    const location = locationForTrails(
      this.requestsTrail(),
      this.interactionTrail(),
      currentSpecContext.currentSpecEndpoints
    );

    if (!location) {
      throw new Error('no location found for diff');
    }

    return new DiffLocation(
      location.pathId,
      location.method,
      location.descriptor
    );
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
    public location: DiffLocation
  ) {
    // @ts-ignore
    this.shapeTrail = (shapeDiff['UnmatchedShape']?.shapeTrail ||
      // @ts-ignore
      shapeDiff['UnspecifiedShape']?.shapeTrail)!;
    if (!this.shapeTrail) {
      throw new Error('A shape trail must be specified with all shape diffs');
    }

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
