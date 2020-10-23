import {
  code,
  IChangeType,
  ICopy,
  IDiffDescription,
  plain,
} from '../interfaces/interpretors';
import { ParsedDiff } from '../parse-diff';
import invariant from 'invariant';

export function descriptionForDiffs(diffs: ParsedDiff[]): IDiffDescription {
  invariant(diffs.length > 0, 'diffs required for description');

  if (diffs.every((i) => i.isNewRegionDiff())) {
    return descriptionForNewRegions(diffs[0]);
  }

  if (diffs.every((i) => i.isBodyShapeDiff())) {
    return descriptionForShapeDiff(diffs);
  }

  invariant(true, 'diff descriptions for different diff types not allowed');
}

function descriptionForNewRegions(diff: ParsedDiff): IDiffDescription {
  const location = diff.location();
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

function descriptionForShapeDiff(diffs: ParsedDiff[]): IDiffDescription {
  const location = diffs[0].location();

  const shapeDiffs = diffs.map((i) => i.asShapeDiff()!);

  const unmatchedCount = shapeDiffs.filter((i) => i.isUnmatched).length;
  const unspecifiedCount = shapeDiffs.filter((i) => i.isUnspecified).length;

  const jsonTrailPath = shapeDiffs[0]!.jsonTrail.path;
  const jsonTrailLast = jsonTrailPath[jsonTrailPath.length - 1]!;

  //known spec shape, unmatching values
  if (unmatchedCount > 0 && unspecifiedCount === 0) {
    return {
      title: [code(JSON.stringify(jsonTrailLast) + 'changed')], // make me pretty
      location,
      changeType: IChangeType.Changed,
      assertion: [code('expected use spec namer here')],
    };
  }

  //new spec shape, no known value. unspecified should always be === 1. even for multiple shape types
  if (unmatchedCount === 0 && unspecifiedCount === 1) {
    return {
      title: [code(JSON.stringify(jsonTrailLast) + 'observed')], // make me pretty
      location,
      changeType: IChangeType.Added,
      assertion: [code('expected use spec namer here')],
    };
  }

  if (unmatchedCount > 1 && unspecifiedCount > 1) {
    invariant(
      'There should never be a shape trail that is unmatched and unspecified'
    );
  }

  invariant('Unexpected shape diff combinations');

  //
  //
  //
  // const jsonTrailPath = asShapeDiff!.jsonTrail.path;
  // const jsonTrailLast = jsonTrailPath[jsonTrailPath.length - 1];
  //
  // if (jsonTrailLast['JsonObjectKey']) {
  //   const fieldName = (jsonTrailLast as IJsonObjectKey).JsonObjectKey.key;
  // }
}
