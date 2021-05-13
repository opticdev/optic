//TODO: Figure out where this logic should go

import { IPathMapping } from '@useoptic/cli-config';
import { getSpecEventsFrom } from '@useoptic/cli-config/build/helpers/read-specification-json';
import { CaptureInteractionIterator } from '@useoptic/cli-shared/build/captures/avro/file-system/interaction-iterator';
import { IHttpInteraction } from '@useoptic/domain-types';
import * as OpticEngine from '@useoptic/diff-engine-wasm/engine/build';
import {
  InMemoryOpticContextBuilder,
  InMemorySpectacle,
} from '@useoptic/spectacle/build/in-memory';

// This concept came from the Scala codebase's "Concern" concept
// https://github.com/opticdev/optic-core/blob/master/core/optic/shared/src/main/scala/com/useoptic/coverage/CoverageConcerns.scala
// JS/TS doesn't have the kind of value-types or case-classes that scala does,
// but we can emulate them like this. I think...

// o.O
const createDataClass = <P extends { [key: string]: any }>(
  func: (args: P) => void
): ((args?: P) => string) => {
  return (args?: P) => `${func.name}${args && `-${JSON.stringify(args)}`}`;
};

const TotalInteractions = createDataClass(function TotalInteractions() {});
const TotalUnmatchedPath = createDataClass(function TotalUnmatchedPath() {});
const TotalForPath = createDataClass(function TotalForPath(args: {
  path_id: String;
}) {});
const TotalForPathAndMethod = createDataClass(
  function TotalForPathAndMethod(args: {
    path_id: String;
    http_method: String;
  }) {}
);
const TotalForPathAndMethodAndStatusCode = createDataClass(
  function TotalForPathAndMethodAndStatusCode(args: {
    path_id: String;
    http_method: String;
    http_status_code: number;
  }) {}
);
const TotalForPathAndMethodWithoutBody = createDataClass(
  function TotalForPathAndMethodWithoutBody(args: {
    path_id: String;
    http_method: String;
  }) {}
);
const TotalForPathAndMethodAndContentType = createDataClass(
  function TotalForPathAndMethodAndContentType(args: {
    path_id: String;
    http_method: String;
    request_content_type: String;
  }) {}
);
const TotalForPathAndMethodAndStatusCodeWithoutBody = createDataClass(
  function TotalForPathAndMethodAndStatusCodeWithoutBody(args: {
    path_id: String;
    http_method: String;
    http_status_code: number;
  }) {}
);
const TotalForPathAndMethodAndStatusCodeAndContentType = createDataClass(
  function TotalForPathAndMethodAndStatusCodeAndContentType(args: {
    path_id: String;
    http_method: String;
    http_status_code: number;
    response_content_type: String;
  }) {}
);
const TotalForRequest = createDataClass(function TotalForRequest(args: {
  request_id: string;
}) {});
const TotalForResponse = createDataClass(function TotalForResponse(args: {
  response_id: string;
}) {});

type ICoverageMap = { [key: string]: number };

const recordEvent = (evt: string, coverage_map: ICoverageMap) => {
  coverage_map[evt] = (coverage_map[evt] ?? 0) + 1;
};

const countFormatter = (
  key: string,
  diffs: ICoverageMap,
  noDiffs: ICoverageMap
) => {
  const diffs_count = diffs[key] ?? 0;
  const no_diffs_count = noDiffs[key] ?? 0;

  return `${no_diffs_count > 0 ? no_diffs_count : `No Coverage`}${
    diffs_count > 0 ? ` | ${diffs_count} with diffs` : ''
  }`;
};

export async function printCoverage(
  paths: IPathMapping,
  map_with_diffs: ICoverageMap,
  map_without_diffs: ICoverageMap
) {
  const events = await getSpecEventsFrom(paths.specStorePath);
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    events
  );

  const inMemorySpectacle = new InMemorySpectacle(opticContext, []);

  const query = `query {
    requests {
      id
      absolutePathPatternWithParameterNames
      pathId
      method
      bodies {
        contentType
        rootShapeId
      }
      responses {
        id
        statusCode
        bodies {
          contentType
          rootShapeId
        }
      }
    }
    endpointChanges {
      endpoints {
        pathId
        path
        method
      }
    }
  }`;

  const response = await inMemorySpectacle.query<{
    requests: Array<{
      id: string;
      absolutePathPatternWithParameterNames: string;
      pathId: string;
      method: String;
      bodies: Array<{
        contentType: string;
        rootShapeId: string;
      }>;
      responses: Array<{
        id: string;
        statusCode: number;
        bodies: Array<{
          contentType: string;
          rootShapeId: string;
        }>;
      }>;
    }>;
    endpointChanges: {
      endpoints: Array<{
        pathId: string;
        path: string;
        method: string;
      }>;
    };
  }>({ query, variables: {} });

  if (response.data) {
    for (const endpoint of response.data.endpointChanges.endpoints) {
      console.log(
        `Endpoint: ${endpoint.method} ${endpoint.path} -> ${countFormatter(
          TotalForPathAndMethod({
            path_id: endpoint.pathId,
            http_method: endpoint.method,
          }),
          map_with_diffs,
          map_without_diffs
        )}`
      );

      const requests = response.data.requests.filter(
        (r) => r.pathId === endpoint.pathId
      );

      if (requests.length > 0) {
        for (const request of requests) {
          if (request.bodies.length > 0) {
            console.log(
              `\t Request: ${request.bodies[0].contentType} -> ${countFormatter(
                TotalForPathAndMethodAndContentType({
                  path_id: request.pathId,
                  http_method: endpoint.method,
                  request_content_type: request.bodies[0].contentType,
                }),
                map_with_diffs,
                map_without_diffs
              )}`
            );
          } else {
            console.log(
              `\t Request: No Body -> ${countFormatter(
                TotalForPathAndMethodWithoutBody({
                  path_id: endpoint.pathId,
                  http_method: endpoint.method,
                }),
                map_with_diffs,
                map_without_diffs
              )}`
            );
          }

          for (const response of request.responses) {
            if (response.bodies.length > 0) {
              console.log(
                `\t\t Response: ${response.statusCode}: ${
                  response.bodies[0].contentType
                } -> ${countFormatter(
                  TotalForPathAndMethodAndStatusCodeAndContentType({
                    path_id: endpoint.pathId,
                    http_method: endpoint.method,
                    http_status_code: response.statusCode,
                    response_content_type: response.bodies[0].contentType,
                  }),
                  map_with_diffs,
                  map_without_diffs
                )}`
              );
            } else {
              console.log(
                `\t\t Response: ${
                  response.statusCode
                }: No Body -> ${countFormatter(
                  TotalForPathAndMethodAndStatusCodeWithoutBody({
                    path_id: endpoint.pathId,
                    http_method: endpoint.method,
                    http_status_code: response.statusCode,
                  }),
                  map_with_diffs,
                  map_without_diffs
                )}`
              );
            }
          }
        }
      }
    }
  }
}

export async function computeCoverage(paths: IPathMapping, captureId: string) {
  const events = await getSpecEventsFrom(paths.specStorePath);
  // Will this be laggy? Specs might get big :thinking_face:
  const spec = OpticEngine.spec_from_events(JSON.stringify(events));

  const captureIterator = CaptureInteractionIterator(
    {
      captureId,
      captureBaseDirectory: paths.capturesPath,
    },
    (_) => true
  );

  const coverages = (async function* (interactionItems) {
    for await (let item of interactionItems) {
      if (!item.hasMoreInteractions) break;
      if (!item.interaction) continue;

      const diff_str = OpticEngine.diff_interaction(
        JSON.stringify(item.interaction.value),
        spec
      );
      // Maybe we could be more clever here later
      // Would also love to get real types in here
      const diff: Array<any> = JSON.parse(diff_str);

      let is_diff = diff.length > 0;

      yield {
        coverage: interactionToCoverage(spec, item.interaction.value),
        is_diff,
      };
    }
  })(captureIterator);

  let combined_diff_map: ICoverageMap = {};
  let combined_non_diff_map: ICoverageMap = {};

  for await (let { coverage: individual_coverage, is_diff } of coverages) {
    let chosen_map = is_diff ? combined_diff_map : combined_non_diff_map;
    for (const [k, v] of Object.entries(individual_coverage)) {
      chosen_map[k] = (chosen_map[k] ?? 0) + v;
    }
  }

  return {
    with_diffs: combined_diff_map,
    without_diffs: combined_non_diff_map,
  };
}

type BodyDescriptor = {
  body?: { http_content_type: string; root_shape_id: string };
};

function interactionToCoverage(
  spec: OpticEngine.WasmSpecProjection,
  interaction: IHttpInteraction
) {
  let coverage_map: ICoverageMap = {};

  recordEvent(TotalInteractions(), coverage_map);

  const path_id = OpticEngine.spec_resolve_path_id(
    spec,
    interaction.request.path
  );

  if (path_id) {
    recordEvent(TotalForPath({ path_id }), coverage_map);
    const request_data = JSON.parse(
      OpticEngine.spec_resolve_request(
        spec,
        path_id,
        interaction.request.method,
        interaction.request.body?.contentType ?? undefined
      )
    ) as [string, BodyDescriptor] | null;
    if (!request_data) {
      // Since we got a `path_id`, there should never be 0 requests here
      // Error
    } else {
      recordEvent(
        TotalForPathAndMethod({
          path_id,
          http_method: interaction.request.method,
        }),
        coverage_map
      );

      // Look up the appropriate request by its content type
      const [request_id, request] = request_data;

      recordEvent(TotalForRequest({ request_id }), coverage_map);

      if (request.body) {
        recordEvent(
          TotalForPathAndMethodAndContentType({
            path_id,
            http_method: interaction.request.method,
            request_content_type: request.body.http_content_type,
          }),
          coverage_map
        );
      } else {
        recordEvent(
          TotalForPathAndMethodWithoutBody({
            path_id,
            http_method: interaction.request.method,
          }),
          coverage_map
        );
      }

      const response_data = JSON.parse(
        OpticEngine.spec_resolve_response(
          spec,
          interaction.request.method,
          interaction.response.statusCode,
          path_id,
          interaction.response.body?.contentType ?? undefined
        )
      ) as [string, BodyDescriptor] | null;

      if (!response_data) {
        // Undocumented response
      } else {
        recordEvent(
          TotalForPathAndMethodAndStatusCode({
            path_id,
            http_method: interaction.request.method,
            http_status_code: interaction.response.statusCode,
          }),
          coverage_map
        );
        const [response_id, response] = response_data;
        recordEvent(TotalForResponse({ response_id }), coverage_map);

        if (response.body) {
          recordEvent(
            TotalForPathAndMethodAndStatusCodeAndContentType({
              path_id,
              http_method: interaction.request.method,
              http_status_code: interaction.response.statusCode,
              response_content_type: response.body.http_content_type,
            }),
            coverage_map
          );
        } else {
          recordEvent(
            TotalForPathAndMethodAndStatusCodeWithoutBody({
              path_id,
              http_method: interaction.request.method,
              http_status_code: interaction.response.statusCode,
            }),
            coverage_map
          );
        }
      }
    }
  } else {
    recordEvent(TotalUnmatchedPath(), coverage_map);
  }

  return coverage_map;
}
