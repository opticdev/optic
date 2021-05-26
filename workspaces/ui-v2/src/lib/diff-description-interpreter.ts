import { BodyShapeDiff, ParsedDiff } from './parse-diff';
import {
  CurrentSpecContext,
  IChangeType,
  IDiffDescription,
  IParsedLocation,
} from './Interfaces';
import { getExpectationsForShapeTrail } from './shape-diff-dsl-rust';
import {
  code,
  ICopy,
  plain,
} from '../optic-components/diffs/render/ICopyRender';
import { IJsonObjectKey } from '../../../cli-shared/build/diffs/json-trail';
//@ts-ignore
const { toJsonExample } = require('@useoptic/shape-hash');

export function descriptionForNewRegions(
  diff: ParsedDiff,
  location: IParsedLocation
): IDiffDescription {
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

  const getJsonBodyToPreview = (interaction: any) => {
    const body =
      (location.inRequest && interaction.request.body) ||
      (location.inResponse && interaction.response.body);

    if (body) {
      const { shapeHashV1Base64, asText, asJsonString } = body.value;

      if (asJsonString) {
        return {
          asJson: JSON.parse(asJsonString),
          asText: null,
          noBody: false,
        };
      }

      if (shapeHashV1Base64) {
        return {
          asJson: toJsonExample(shapeHashV1Base64, 'base64'),
          asText: null,
          noBody: false,
        };
      }
      if (asText) {
        return { asJson: null, asText: asText, noBody: false };
      }
      return { asJson: null, asText: null, noBody: false };
    } else {
      return { asJson: null, asText: null, noBody: true };
    }
  };

  return {
    title,
    changeType: IChangeType.Added,
    location,
    diffHash: diff.diffHash,
    assertion: [plain('Undocumented Body Observed')],
    getJsonBodyToPreview,
  };
}

export async function descriptionForShapeDiff(
  asShapeDiff: BodyShapeDiff,
  query: any,
  currentSpecContext: CurrentSpecContext
): Promise<IDiffDescription> {
  const location = asShapeDiff.location;

  const jsonTrailPath = asShapeDiff.jsonTrail.path;
  const jsonTrailLast = jsonTrailPath[jsonTrailPath.length - 1]!;

  const getJsonBodyToPreview = (interaction: any) => {
    const body =
      (location.inRequest && interaction.request.body) ||
      (location.inResponse && interaction.response.body);

    if (body) {
      const { shapeHashV1Base64, asText, asJsonString } = body.value;

      if (asJsonString) {
        return {
          asJson: JSON.parse(asJsonString),
          asText: null,
          noBody: false,
        };
      }

      if (shapeHashV1Base64) {
        return {
          asJson: toJsonExample(shapeHashV1Base64, 'base64'),
          asText: null,
          noBody: false,
        };
      }
      if (asText) {
        return { asJson: null, asText: asText, noBody: false };
      }
      return { asJson: null, asText: null, noBody: false };
    } else {
      return { asJson: null, asText: null, noBody: true };
    }
  };

  const expected = await getExpectationsForShapeTrail(
    asShapeDiff.shapeTrail,
    asShapeDiff.jsonTrail,
    query,
    currentSpecContext
  );

  //root handler
  if (jsonTrailPath.length === 0) {
    return {
      title: [plain('root shape did not match'), code(expected.shapeName())],
      location,
      changeType: IChangeType.Changed,
      assertion: [plain('expected'), code(expected.shapeName())],
      diffHash: asShapeDiff.diffHash(),
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
        diffHash: asShapeDiff.diffHash(),
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
      diffHash: asShapeDiff.diffHash(),

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
      diffHash: asShapeDiff.diffHash(),

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
    diffHash: asShapeDiff.diffHash(),
    getJsonBodyToPreview,
  };

  // invariant(false, 'Unexpected shape diff');
}
