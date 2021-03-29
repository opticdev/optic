import {
  code,
  IChangeType,
  ICopy,
  IDiffDescription,
  plain,
} from '../interfaces/interpretors';
import { ParsedDiff } from '../parse-diff';
import { Actual, Expectation } from './shape-diff-dsl';
import { JsonHelper } from '@useoptic/domain';
import { DiffRfcBaseState } from '@useoptic/cli-shared/build/diffs/diff-rfc-base-state';
import { IJsonObjectKey } from '@useoptic/cli-shared/build/diffs/json-trail';

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
        return { asJson: null, asText: null, noBody: true };
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
      return { asJson: null, asText: null, noBody: true };
    }
  };

  const expected = new Expectation(
    diff,
    rfcBaseState,
    asShapeDiff.normalizedShapeTrail,
    asShapeDiff.jsonTrail
  );

  //root handler
  if (jsonTrailPath.length === 0) {
    return {
      title: [
        plain('root shape'),
        plain('did not match'),
        code(expected.shapeName()),
      ],
      location,
      changeType: IChangeType.Changed,
      assertion: [plain('expected'), code(expected.shapeName())],
      getJsonBodyToPreview,
    };
  }

  //known field handler
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
        assertion: [plain('expected'), code(expected.shapeName())],
        getJsonBodyToPreview,
      };
    }
  }
  //undocumented field handler
  const lastIsField = (jsonTrailLast as IJsonObjectKey).JsonObjectKey;
  if (asShapeDiff.isUnspecified && lastIsField) {
    return {
      title: [
        plain('undocumented field'),
        code(lastIsField.key),
        plain('observed'),
      ],
      location,
      changeType: IChangeType.Added,
      assertion: [code('undocumented field')],
      getJsonBodyToPreview,
    };
  }

  //list item handler
  if (expected.isListItemShape()) {
    return {
      title: [plain('list items did not match'), code(expected.shapeName())],
      location,
      changeType: IChangeType.Changed,
      assertion: [plain('expected'), code(expected.shapeName())],
      getJsonBodyToPreview,
    };
  }

  //we shouldn't ever get there
  return {
    title: [plain('unknown diff kind')],
    location,
    changeType: IChangeType.Changed,
    assertion: [],
    unknownDiffBehavior: true,
    getJsonBodyToPreview,
  };
  // invariant(false, 'Unexpected shape diff');
}
