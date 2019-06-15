const scalajs = require('./domain.js')

export function newRfcService() {
    return new scalajs.com.seamless.contexts.rfc.RfcService()
}

export const ShapeCommands = scalajs.com.seamless.contexts.data_types.Commands
export const Primitives = scalajs.com.seamless.contexts.data_types.Primitives
export const DataTypesHelper = scalajs.com.seamless.contexts.data_types.DataTypesServiceHelper()
export const ContentTypesHelper = scalajs.com.seamless.contexts.requests.ContentTypes()

export const RfcCommands = scalajs.com.seamless.contexts.rfc.Commands

export const Facade = scalajs.com.seamless.contexts.rfc.RfcServiceJSFacade()
export const Queries = (eventStore, aggregateId) => new scalajs.com.seamless.contexts.rfc.Queries(eventStore, aggregateId)
