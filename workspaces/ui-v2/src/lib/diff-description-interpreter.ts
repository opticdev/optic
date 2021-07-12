import { BodyShapeDiff, ParsedDiff } from './parse-diff';
import {
  BodyPreview,
  CurrentSpecContext,
  IChangeType,
  IDiffDescription,
  IParsedLocation,
} from './Interfaces';
import { getExpectationsForShapeTrail } from './shape-diff-dsl-rust';
import { code, ICopy, plain } from '<src>/pages/diffs/components/ICopyRender';
import { IJsonObjectKey } from '@useoptic/cli-shared/build/diffs/json-trail';
import { IHttpInteraction } from '@useoptic/optic-domain';
import { toJsonExample } from '@useoptic/shape-hash';

const getJsonBodyToPreview = (
  location: IParsedLocation,
  interaction: IHttpInteraction
): BodyPreview => {
  const body =
    (location.descriptor.type === 'query' && interaction.request.query) ||
    (location.descriptor.type === 'request' &&
      interaction.request.body.value) ||
    (location.descriptor.type === 'response' &&
      interaction.response.body.value);

  if (body) {
    const { shapeHashV1Base64, asText, asJsonString } = body;

    if (asJsonString) {
      return {
        asJson: JSON.parse(asJsonString),
        asText: null,
        noBody: false,
      };
    }

    if (shapeHashV1Base64) {
      return {
        asJson: toJsonExample(shapeHashV1Base64),
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

export function descriptionForNewRegions(
  diff: ParsedDiff,
  location: IParsedLocation
): IDiffDescription {
  let title: ICopy[] = [];
  if (location.descriptor.type === 'query') {
    title = [plain('undocumented query parameters observed')];
  }
  if (
    location.descriptor.type === 'request' ||
    location.descriptor.type === 'path_request'
  ) {
    title = [
      plain('undocumented'),
      code(location.descriptor.contentType),
      plain('request observed'),
    ];
  }
  if (
    location.descriptor.type === 'response' ||
    location.descriptor.type === 'path_response'
  ) {
    title = [
      plain('undocumented'),
      code(location.descriptor.statusCode.toString()),
      plain('response with'),
      code(location.descriptor.contentType || 'No Body'),
      plain('observed'),
    ];
  }

  return {
    title,
    changeType: IChangeType.Added,
    location,
    diffHash: diff.diffHash,
    assertion: [plain('Undocumented Body Observed')],
    getJsonBodyToPreview: getJsonBodyToPreview.bind(null, location),
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
      getJsonBodyToPreview: getJsonBodyToPreview.bind(null, location),
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
        getJsonBodyToPreview: getJsonBodyToPreview.bind(null, location),
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
      getJsonBodyToPreview: getJsonBodyToPreview.bind(null, location),
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
      getJsonBodyToPreview: getJsonBodyToPreview.bind(null, location),
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
    getJsonBodyToPreview: getJsonBodyToPreview.bind(null, location),
  };
}
