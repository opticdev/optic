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
import { Expectation } from './shape-diff-dsl';
import { JsonHelper } from '@useoptic/domain';

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
      plain('undocumented'),
      code(location.inRequest.contentType || 'No Body'),
      plain('request observed'),
    ];
  }
  if (location.inResponse) {
    title = [
      plain('undocumented'),
      code(location.inResponse.statusCode.toString()),
      plain('response with'),
      code(location.inResponse.contentType || 'No Body'),
      plain('observed'),
    ];
  }

  return {
    title,
    changeType: IChangeType.Added,
    location,
    assertion: [plain('Undocumented Body Observed')],
    getJsonBodyToPreview: (interaction: any) => {
      const body =
        (location.inRequest && interaction.request.body) ||
        (location.inResponse && interaction.response.body);

      if (body) {
        return JsonHelper.fromInteractionBodyToJs(body);
      } else {
        return { asJson: null, asText: null };
      }
    },
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

  const getJsonBodyToPreview = (interaction: any) => {
    const body =
      (location.inRequest && interaction.request.body) ||
      (location.inResponse && interaction.response.body);

    if (body) {
      return JsonHelper.fromInteractionBodyToJs(body);
    } else {
      return { asJson: null, asText: null };
    }
  };

  const expected = new Expectation(
    diff,
    rfcBaseState,
    asShapeDiff.shapeTrail,
    asShapeDiff.jsonTrail
  );

  if (expected.isField()) {
    if (asShapeDiff.isUnmatched) {
      return {
        title: [
          plain('values of '),
          code(expected.fieldKey()),
          plain('did not match'),
          code(expected.shapeName()),
        ],
        location,
        changeType: IChangeType.Changed,
        assertion: [code('expected ' + expected.shapeName())],
        getJsonBodyToPreview,
      };
    }

    if (asShapeDiff.isUnspecified) {
      return {
        title: [
          plain('undocumented field'),
          code(expected.fieldKey()),
          plain('observed'),
        ],
        location,
        changeType: IChangeType.Added,
        assertion: [code('undocumented field')],
        getJsonBodyToPreview,
      };
    }
  }

  //@todo impliment others

  invariant('Unexpected shape diff');
}
