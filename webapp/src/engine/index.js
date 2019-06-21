const scalajs = require('./domain.js')

export const ShapeCommands = scalajs.com.seamless.contexts.data_types.Commands
export const Primitives = scalajs.com.seamless.contexts.data_types.Primitives
export const DataTypesHelper = scalajs.com.seamless.contexts.data_types.DataTypesServiceHelper()
export const RequestsHelper = scalajs.com.seamless.contexts.requests.RequestsServiceHelper()
export const ContentTypesHelper = scalajs.com.seamless.contexts.requests.ContentTypes()

export const RfcCommands = scalajs.com.seamless.contexts.rfc.Commands
export const RequestsCommands = scalajs.com.seamless.contexts.requests.Commands

export const Facade = scalajs.com.seamless.contexts.rfc.RfcServiceJSFacade()
export const Queries = (eventStore, aggregateId) => new scalajs.com.seamless.contexts.rfc.Queries(eventStore, aggregateId)
