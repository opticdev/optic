//TODO: Figure out where this logic should go

import { IPathMapping } from "@useoptic/cli-config";
import { getSpecEventsFrom } from "@useoptic/cli-config/build/helpers/read-specification-json";
import { CaptureInteractionIterator } from "@useoptic/cli-shared/build/captures/avro/file-system/interaction-iterator";
import { IHttpInteraction } from "@useoptic/domain-types";
import * as DiffEngine from '@useoptic/diff-engine-wasm/engine/build';

// This concept came from the Scala codebase's "Concern" concept
// https://github.com/opticdev/optic-core/blob/master/core/optic/shared/src/main/scala/com/useoptic/coverage/CoverageConcerns.scala
// JS/TS doesn't have the kind of value-types or case-classes that scala does,
// but we can emulate them like this. I think...

// o.O
const createDataClass = <P extends Array<any>>(func: (...args: P)=>void): (...args: P)=>string => {
  return (...args: P) => `${func.name}-${args.map(arg=>JSON.stringify(arg)).join("-")}`
}

const TotalInteractions = createDataClass(function TotalInteractions() {})
const TotalUnmatchedPath = createDataClass(function TotalUnmatchedPath() {})
const TotalForPath = createDataClass(function TotalForPath(pathId: String) {})
const TotalForPathAndMethod = createDataClass(function TotalForPathAndMethod(pathId: String, httpMethod: String) {})
const TotalForPathAndMethodAndStatusCode = createDataClass(function TotalForPathAndMethodAndStatusCode(pathId: String, httpMethod: String, httpStatusCode: number) {})
const TotalForPathAndMethodWithoutBody = createDataClass(function TotalForPathAndMethodWithoutBody(pathId: String, httpMethod: String) {})
const TotalForPathAndMethodAndContentType = createDataClass(function TotalForPathAndMethodAndContentType(pathId: String, httpMethod: String, requestContentType: String) {})
const TotalForPathAndMethodAndStatusCodeWithoutBody = createDataClass(function TotalForPathAndMethodAndStatusCodeWithoutBody(pathId: String, httpMethod: String, httpStatusCode: number) {})
const TotalForPathAndMethodAndStatusCodeAndContentType = createDataClass(function TotalForPathAndMethodAndStatusCodeAndContentType(pathId: String, httpMethod: String, httpStatusCode: number, responseContentType: String) {})
const TotalForRequest = createDataClass(function TotalForRequest(requestId: string) {})
const TotalForResponse = createDataClass(function TotalForResponse(responseId: string) {})

type ICoverageMap = {[key: string]: number};

const recordEvent = (evt: string, is_diff: boolean, coverage_map: ICoverageMap) => {
  const key = `${evt}-${is_diff?'diff':'nodiff'}`;
  coverage_map[key] = (coverage_map[key]??0)+1;
}

async function computeCoverage(
  paths: IPathMapping,
  captureId: string
) {
  const events = await getSpecEventsFrom(paths.specStorePath);
  // Will this be laggy? Specs might get big :thinking_face:
  const spec = DiffEngine.spec_from_events(JSON.stringify(events));

  const captureIterator = CaptureInteractionIterator({
    captureId,
    captureBaseDirectory: paths.capturesPath
  }, (_)=>true);

  const coverages = (async function* (interactionItems){
    for await(let item of interactionItems){
      if (!item.hasMoreInteractions) break;
      if (!item.interaction) continue;

      yield interactionToCoverage(spec, item.interaction.value)
    }
  })(captureIterator)

  let combined_map: ICoverageMap = {};

  for await(let individual_coverage of coverages){
    for(const [k,v] of Object.entries(individual_coverage)) {
      combined_map[k] = (combined_map[k]??0) + v;
    }
  }
}

type BodyDescriptor = {body?:{http_content_type: string, root_shape_id: string}};

function interactionToCoverage(spec: DiffEngine.WasmSpecProjection, interaction: IHttpInteraction) {
  const diff_str = DiffEngine.diff_interaction(JSON.stringify(interaction), spec);
  // Maybe we could be more clever here later
  // Would also love to get real types in here
  const diff: Array<any> = JSON.parse(diff_str);

  let is_diff = diff.length > 0;

  let coverage_map: ICoverageMap = {};

  recordEvent(TotalInteractions(), is_diff, coverage_map);

  const path_id = DiffEngine.spec_resolve_path_id(spec, interaction.request.path);

  if(path_id){
    recordEvent(TotalForPath(path_id), is_diff, coverage_map);
    const requests = JSON.parse(DiffEngine.spec_resolve_requests(spec, path_id, interaction.request.method)) as Array<[string,BodyDescriptor]>;
    if(requests.length === 0) {
      // Undocumented method
    } else if(requests.length === 1) {
      // Proceed
      recordEvent(TotalForPathAndMethod(path_id,interaction.request.method), is_diff, coverage_map);
      const [request_id, request] = requests[0];
      recordEvent(TotalForRequest(request_id), is_diff, coverage_map);

      if(request.body){
        recordEvent(TotalForPathAndMethodAndContentType(path_id, interaction.request.method, request.body.http_content_type), is_diff, coverage_map);
      } else {
        recordEvent(TotalForPathAndMethodWithoutBody(path_id, interaction.request.method), is_diff, coverage_map);
      }

      const responses = JSON.parse(DiffEngine.spec_resolve_responses(spec, interaction.request.method, interaction.response.statusCode,path_id)) as Array<[string, BodyDescriptor]>;

      if(responses.length === 0){
        // Undocumented response
      } else if(responses.length === 1) {
        // Proceed
        recordEvent(TotalForPathAndMethodAndStatusCode(path_id,interaction.request.method, interaction.response.statusCode), is_diff, coverage_map);
        const [response_id, response] = responses[0];
        recordEvent(TotalForResponse(response_id), is_diff, coverage_map);

        if(response.body){
          recordEvent(TotalForPathAndMethodAndStatusCodeAndContentType(path_id, interaction.request.method, interaction.response.statusCode, response.body.http_content_type), is_diff, coverage_map)
        } else {
          recordEvent(TotalForPathAndMethodAndStatusCodeWithoutBody(path_id, interaction.request.method, interaction.response.statusCode), is_diff, coverage_map)
        }
      } else {
        // More than 1 response... Same as case below. Shouldn't happen I don't think?
      }
    } else {
      // More than 1 method... but "There should only ever be one request per method and content type"
      // https://www.notion.so/useoptic/Optic-in-CI-01e647cc49504835a0e2750764d097b6#c2fd9f671b554f8ead8586b7de5b4cb6
    }
  } else {
    recordEvent(TotalUnmatchedPath(), is_diff, coverage_map);
  }

  return coverage_map
}