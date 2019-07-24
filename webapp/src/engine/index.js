import * as scalajs from 'seamless-domain'

export const ShapesCommands = scalajs.com.seamless.contexts.shapes.Commands
export const ShapesHelper = scalajs.com.seamless.contexts.shapes.ShapesHelper()
export const RequestsHelper = scalajs.com.seamless.contexts.requests.RequestsServiceHelper()
export const ContentTypesHelper = scalajs.com.seamless.contexts.requests.ContentTypes()

export const RfcCommands = scalajs.com.seamless.contexts.rfc.Commands
export const RequestsCommands = scalajs.com.seamless.contexts.requests.Commands

export const Facade = scalajs.com.seamless.contexts.rfc.RfcServiceJSFacade()
export const Queries = (eventStore, service, aggregateId) => new scalajs.com.seamless.contexts.rfc.Queries(eventStore, service, aggregateId)


export function commandsToJson(commands) {
    return commands.map(x => JSON.parse(scalajs.CommandSerialization.toJsonString(x)))
}