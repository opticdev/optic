import { IDiff, IShapeDiffResult } from './interfaces/diffs';
import {
  allowedDiffTypesKeys,
  DiffInRequest,
  IRequestBodyLocation,
  IResponseBodyLocation,
  isBodyShapeDiff,
} from './interfaces/interfaces';
import invariant from 'invariant';

class ParsedDiff {
  diffType: string;

  constructor(private serialized_diff: IDiff, interactions: string[]) {
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

  isShapeDiff: () => boolean = () => isBodyShapeDiff(this.diffType);
  isNewRegionDiff: () => boolean = () => !isBodyShapeDiff(this.diffType);
}

interface IParsedLocation {
  pathId: string;
  method: string;
  inRequest?: IRequestBodyLocation;
  inResponse?: IResponseBodyLocation;
}
