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