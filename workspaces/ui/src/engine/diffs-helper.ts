import invariant from 'invariant';
import {
  allowedDiffTypesKeys,
  BodyShapeDiff,
  DiffInRequest,
  DiffInResponse,
  isBodyShapeDiff,
  RequestBodyLocation,
} from './interfaces/interfaces';
import {
  IUnmatchedRequestBodyShape,
  IUnmatchedResponseBodyShape,
} from './interfaces/diffs';

class DiffLifecycleManager {
  constructor(private serialized_diff: any, interactions: string[]) {}

  diffType(): string {
    const keys = Object.keys(this.serialized_diff);
    const typeKey = keys[0];
    invariant(
      keys.length === 1 && allowedDiffTypesKeys.includes(typeKey),
      'Serialized diffs should only have one root key'
    );
    return typeKey!;
  }

  isShapeDiff(): boolean {
    return isBodyShapeDiff(this.diffType());
  }

  inRequest(): boolean {
    return DiffInRequest(this.diffType());
  }

  inResponse(): boolean {
    return DiffInResponse(this.diffType());
  }

  asRequestBodyShapeDiff: BodyShapeDiff<
    IUnmatchedRequestBodyShape,
    RequestBodyLocation
  > = {};

  asResponseBodyShapeDiff: BodyShapeDiff<
    IUnmatchedResponseBodyShape,
    RequestBodyLocation
  > = {};
}
