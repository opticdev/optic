import scalajs from './domain.js'

console.log(scalajs)

export function newRfcService() {
	return new scalajs.com.seamless.contexts.rfc.RfcService()
}

// export function newRfcServiceFromCommands(commandsString, aggregateId) {
// 	return scalajs.com.seamless.contexts.rfc.RfcServiceJSFacade().fromCommands(commandsString, aggregateId)
// }
//
// window.newRfcServiceFromCommands = newRfcServiceFromCommands
// debugger

export const Commands = scalajs.com.seamless.contexts.data_types.Commands
export const Primitives = scalajs.com.seamless.contexts.data_types.Primitives
export const DataTypesHelper = scalajs.com.seamless.contexts.data_types.DataTypesServiceHelper()
export const ContentTypesHelper = scalajs.com.seamless.contexts.requests.ContentTypes()
