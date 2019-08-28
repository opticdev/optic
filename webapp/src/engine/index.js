import * as seamlessEngine from 'seamless-domain'

export const ShapesCommands = seamlessEngine.com.seamless.contexts.shapes.Commands
export const ShapesHelper = seamlessEngine.com.seamless.contexts.shapes.ShapesHelper()
export const RequestsHelper = seamlessEngine.com.seamless.contexts.requests.RequestsServiceHelper()
export const ContentTypesHelper = seamlessEngine.com.seamless.contexts.requests.ContentTypes()

export const RfcCommands = seamlessEngine.com.seamless.contexts.rfc.Commands
export const RequestsCommands = seamlessEngine.com.seamless.contexts.requests.Commands

export const Facade = seamlessEngine.com.seamless.contexts.rfc.RfcServiceJSFacade()
export const Queries = (eventStore, service, aggregateId) => new seamlessEngine.Queries(eventStore, service, aggregateId)


export function commandsToJson(commands) {
    return commands.map(x => JSON.parse(seamlessEngine.CommandSerialization.toJsonString(x)))
}
export function commandsFromJson(commands) {
    return seamlessEngine.CommandSerialization.fromJsonString(JSON.stringify(commands))
}

const { ApiInteraction, ApiRequest, ApiResponse } = seamlessEngine.com.seamless.diff;
export const JsonHelper = seamlessEngine.com.seamless.diff.JsonHelper()
function fromJs(x) {
    return JsonHelper.fromString(JSON.stringify(x))
}

export function toInteraction(sample) {
    return ApiInteraction(
        ApiRequest(sample.request.url, sample.request.method, sample.request.headers['content-type'] || '*/*', fromJs(sample.request.body)),
        ApiResponse(sample.response.statusCode, sample.response.headers['content-type'] || '*/*', fromJs(sample.response.body))
    )
}
export const RequestDiffer = seamlessEngine.com.seamless.diff.RequestDiffer()
export const DiffToCommands = seamlessEngine.com.seamless.diff.DiffToCommands()
console.log(seamlessEngine)