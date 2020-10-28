import {
  code,
  IChangeType,
  ICopy,
  IDiffDescription,
  plain,
} from '../interfaces/interpretors';
import { ParsedDiff } from '../parse-diff';
import invariant from 'invariant';
import { DiffRfcBaseState } from '../interfaces/diff-rfc-base-state';

export function descriptionForDiffs(
  diff: ParsedDiff,
  rfcBaseState: DiffRfcBaseState
): IDiffDescription {
  if (diff.isNewRegionDiff()) {
    return descriptionForNewRegions(diff, rfcBaseState);
  }

  if (diff.isBodyShapeDiff()) {
    return descriptionForShapeDiff(diff, rfcBaseState);
  }
}

function descriptionForNewRegions(
  diff: ParsedDiff,
  rfcBaseState: DiffRfcBaseState
): IDiffDescription {
  const location = diff.location(rfcBaseState);
  let title: ICopy[] = [];
  if (location.inRequest) {
    title = [
      code(location.inRequest.contentType || 'No Body'),
      plain('Request observed for the first time'),
    ];
  }
  if (location.inResponse) {
    title = [
      code(location.inResponse.statusCode.toString()),
      plain('Response with'),
      code(location.inResponse.contentType || 'No Body'),
      plain('observed for the first time'),
    ];
  }

  return {
    title,
    changeType: IChangeType.Added,
    location,
    assertion: [plain('Undocumented Body Observed')],
  };
}

function descriptionForShapeDiff(
  diff: ParsedDiff,
  rfcBaseState: DiffRfcBaseState
): IDiffDescription {
  const location = diff.location(rfcBaseState);
  const asShapeDiff = diff.asShapeDiff(rfcBaseState);
  const jsonTrailPath = asShapeDiff.jsonTrail.path;
  const jsonTrailLast = jsonTrailPath[jsonTrailPath.length - 1]!;

  if (asShapeDiff.isUnmatched) {
    return {
      title: [code(JSON.stringify(jsonTrailLast) + 'changed')], // make me pretty
      location,
      changeType: IChangeType.Changed,
      assertion: [code('expected use spec namer here')],
    };
  }

  if (asShapeDiff.isUnspecified) {
    return {
      title: [code(JSON.stringify(jsonTrailLast) + 'observed')], // make me pretty
      location,
      changeType: IChangeType.Added,
      assertion: [code('expected use spec namer here')],
    };
  }

  invariant('Unexpected shape diff');
}
