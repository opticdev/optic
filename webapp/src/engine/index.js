import * as opticEngine from 'optic-domain'

export const ShapesCommands = opticEngine.com.seamless.contexts.shapes.Commands
export const ShapesHelper = opticEngine.com.seamless.contexts.shapes.ShapesHelper()
export const RequestsHelper = opticEngine.com.seamless.contexts.requests.RequestsServiceHelper()
export const ContentTypesHelper = opticEngine.com.seamless.contexts.requests.ContentTypes()
export const NaiveSummary = opticEngine.com.seamless.diff.NaiveSummary()

export const RfcCommands = opticEngine.com.seamless.contexts.rfc.Commands
export const RequestsCommands = opticEngine.com.seamless.contexts.requests.Commands
export const ScalaJSHelpers = opticEngine.ScalaJSHelpers

export const Facade = opticEngine.com.seamless.contexts.rfc.RfcServiceJSFacade()
export const Queries = (eventStore, service, aggregateId) => new opticEngine.Queries(eventStore, service, aggregateId)


export function commandsToJson(commands) {
    return commands.map(x => JSON.parse(opticEngine.CommandSerialization.toJsonString(x)))
}
export function commandsFromJson(commands) {
    return opticEngine.CommandSerialization.fromJsonString(JSON.stringify(commands))
}
export function commandsToJs(commandSequence) {
    return opticEngine.CommandSerialization.toJs(commandSequence)
}
export function commandToJs(command) {
    return opticEngine.CommandSerialization.toJs(command)
}

const { ApiInteraction, ApiRequest, ApiResponse } = opticEngine.com.seamless.diff;
export const JsonHelper = opticEngine.com.seamless.diff.JsonHelper()
function fromJs(x) {
    return JsonHelper.fromString(JSON.stringify(x))
}

export const mapScala = (collection) => (handler) => {
  return ScalaJSHelpers.toJsArray(collection).map(handler)
}

export const everyScala = (collection) => (handler) => {
  return ScalaJSHelpers.toJsArray(collection).every(handler)
}
export const lengthScala = (collection) => {
  return ScalaJSHelpers.toJsArray(collection).length
}

export function toInteraction(sample) {
    return ApiInteraction(
        ApiRequest(sample.request.url, sample.request.method, sample.request.headers['content-type'] || '*/*', fromJs(sample.request.body)),
        ApiResponse(sample.response.statusCode, sample.response.headers['content-type'] || '*/*', fromJs(sample.response.body))
    )
}
export const RequestDiffer = opticEngine.com.seamless.diff.RequestDiffer()
export const DiffToCommands = opticEngine.com.seamless.diff.DiffToCommands
// console.log(opticEngine)
