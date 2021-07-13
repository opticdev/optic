import { BodyShapeDiff, ParsedDiff, DiffLocation } from './parse-diff';
import {
  BodyPreview,
  CurrentSpecContext,
  IChangeType,
  IDiffDescription,
} from './Interfaces';
import { getExpectationsForShapeTrail } from './shape-diff-dsl-rust';
import { code, ICopy, plain } from '<src>/pages/diffs/components/ICopyRender';
import { IJsonObjectKey } from '@useoptic/cli-shared/build/diffs/json-trail';
import { IHttpInteraction } from '@useoptic/optic-domain';
import { toJsonExample } from '@useoptic/shape-hash';

const getJsonBodyToPreview = (
  location: DiffLocation,
  interaction: IHttpInteraction
): BodyPreview => {
  const body =
    (location.isQueryParameter() && interaction.request.query) ||
    (location.isRequest() && interaction.request.body.value) ||
    (location.isResponse() && interaction.response.body.value);

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
  location: DiffLocation
): IDiffDescription {
  let title: ICopy[] = [];
  if (location.isQueryParameter()) {
    title = [plain('undocumented query parameters observed')];
  }
  const requestDescriptor = location.getRequestDescriptor();
  if (requestDescriptor) {
    title = [
      plain('undocumented'),
      code(requestDescriptor.contentType),
      plain('request observed'),
    ];
  }
  const responseDescriptor = location.getResponseDescriptor();
  if (responseDescriptor) {
    title = [
      plain('undocumented'),
      code(responseDescriptor.statusCode.toString()),
      plain('response with'),
      code(responseDescriptor.contentType || 'No Body'),
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
    const undocumentedLocation = location.isQueryParameter()
      ? 'undocumented query parameter'
      : 'undocumented field';
    return {
      title: [
        plain(undocumentedLocation),
        code(lastIsField.key),
        plain('observed'),
      ],
      location,
      changeType: IChangeType.Added,
      diffHash: asShapeDiff.diffHash(),
      assertion: [code(undocumentedLocation)],
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
