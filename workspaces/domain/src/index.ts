import {IApiInteraction} from './types';

export {IApiInteraction};
const opticEngine = require('./domain.js');

export const ShapesCommands = opticEngine.com.useoptic.contexts.shapes.Commands;
export const ShapesHelper = opticEngine.com.useoptic.contexts.shapes.ShapesHelper();
export const RequestsHelper = opticEngine.com.useoptic.contexts.requests.RequestsServiceHelper();
export const ContentTypesHelper = opticEngine.com.useoptic.contexts.requests.ContentTypes();
export const NaiveSummary = opticEngine.com.useoptic.diff.NaiveSummary();

export const RfcCommands = opticEngine.com.useoptic.contexts.rfc.Commands;
export const RequestsCommands = opticEngine.com.useoptic.contexts.requests.Commands;
export const RfcCommandContext = opticEngine.com.useoptic.contexts.rfc.RfcCommandContext;
export const ScalaJSHelpers = opticEngine.ScalaJSHelpers;

export const Facade = opticEngine.com.useoptic.contexts.rfc.RfcServiceJSFacade();
export const Queries = (eventStore: any, service: any, aggregateId: string) => new opticEngine.Queries(eventStore, service, aggregateId);


export function commandsToJson(commands: any[]) {
  return commands.map(x => JSON.parse(opticEngine.CommandSerialization.toJsonString(x)));
}

export function commandsFromJson(commands: any[]) {
  return opticEngine.CommandSerialization.fromJsonString(JSON.stringify(commands));
}

export function commandsToJs(commandSequence: any) {
  return opticEngine.CommandSerialization.toJs(commandSequence);
}

export function commandToJs(command: any) {
  return opticEngine.CommandSerialization.toJs(command);
}

export const JsonHelper = opticEngine.com.useoptic.diff.JsonHelper();

function fromJs(x: any) {
  if (typeof x === 'undefined') {
    return JsonHelper.toNone();
  }
  return JsonHelper.toSome(JsonHelper.fromString(JSON.stringify(x)));
}

export const mapScala = (collection: any) => (handler: any) => {
  return ScalaJSHelpers.toJsArray(collection).map(handler);
};

export const everyScala = (collection: any) => (handler: any) => {
  return ScalaJSHelpers.toJsArray(collection).every(handler);
};
export const lengthScala = (collection: any) => {
  return ScalaJSHelpers.toJsArray(collection).length;
};

const {ApiInteraction, ApiRequest, ApiResponse} = opticEngine.com.useoptic.diff;

export function toInteraction(sample: IApiInteraction) {
  return ApiInteraction(
    ApiRequest(sample.request.url, sample.request.method, sample.request.queryString || '', sample.request.headers['content-type'] || '*/*', fromJs(sample.request.body)),
    ApiResponse(sample.response.statusCode, sample.response.headers['content-type'] || '*/*', fromJs(sample.response.body))
  );
}

export const InteractionDiffer = opticEngine.com.useoptic.diff.InteractionDiffer;
export const RequestDiffer = opticEngine.com.useoptic.diff.RequestDiffer();
export const Interpreters = opticEngine.com.useoptic.diff.interpreters;
export const PluginRegistry = opticEngine.com.useoptic.diff.PluginRegistry;
export const QueryStringDiffer = opticEngine.com.useoptic.diff.query.QueryStringDiffer;
export const {JsQueryStringParser} = opticEngine;
console.log(opticEngine);
