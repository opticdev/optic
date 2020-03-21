export const opticEngine = require('./domain.js');

const {contexts, diff} = opticEngine.com.useoptic;

export const ShapesCommands = contexts.shapes.Commands;
export const ShapesHelper = contexts.shapes.ShapesHelper();
export const RequestsHelper = contexts.requests.RequestsServiceHelper();
export const ContentTypesHelper = contexts.requests.ContentTypes();

export const RfcCommands = contexts.rfc.Commands;
export const RequestsCommands = contexts.requests.Commands;
export const RfcCommandContext = contexts.rfc.RfcCommandContext;
export const ScalaJSHelpers = opticEngine.ScalaJSHelpers;

export const CompareEquality = opticEngine.com.useoptic.CompareEquality();

export const Facade = contexts.rfc.RfcServiceJSFacade();
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

export const JsonHelper = opticEngine.com.useoptic.JsonHelper();

function fromJs(x: any) {
  if (typeof x === 'undefined') {
    return JsonHelper.toNone();
  }
  return JsonHelper.toSome(JsonHelper.fromString(JSON.stringify(x)));
}

export const mapScala = (collection: any) => (handler: any) => {
  return ScalaJSHelpers.toJsArray(collection).map(handler);
};

export const filterScala = (collection: any) => (handler: any) => {
  return ScalaJSHelpers.toJsArray(collection).filter(handler);
};

export const getOrUndefined = (option: any) => {
  return ScalaJSHelpers.getOrUndefined(option);
};

export const getOrUndefinedJson = (option: any) => {
  return ScalaJSHelpers.getOrUndefinedJson(option);
};

export const headOrUndefined = (seq: any) => {
  return ScalaJSHelpers.headOrUndefined(seq);
};

export const everyScala = (collection: any) => (handler: any) => {
  return ScalaJSHelpers.toJsArray(collection).every(handler);
};
export const lengthScala = (collection: any) => {
  return ScalaJSHelpers.length(collection);
};
export const toOption = (undefOr: any) => {
  return ScalaJSHelpers.toOption(undefOr);
};
export const getIndex = (collection: any) => (index: number) => {
  return ScalaJSHelpers.getIndex(collection, index);
};


export function extractRequestAndResponseBodyAsJs(sample: IHttpInteraction) {
  const requestContentType = sample.request.body.contentType;
  const responseContentType = sample.response.body.contentType;
  const requestBody = sample.request.body.value.asJsonString ? JSON.parse(sample.request.body.value.asJsonString) : (sample.request.body.value.asText ? sample.request.body.value.asText : undefined);
  const responseBody = sample.response.body.value.asJsonString ? JSON.parse(sample.response.body.value.asJsonString) : (sample.response.body.value.asText ? sample.response.body.value.asText : undefined);
  // console.log({
  //   sample,
  //   requestContentType,
  //   requestBody,
  //   responseBody,
  //   responseContentType
  // });
  return {
    requestContentType,
    requestBody,
    responseBody,
    responseContentType
  };
}

export const InteractionDiffer = diff.InteractionDiffer;
export const BodyUtilities = opticEngine.com.useoptic.diff.interactions.BodyUtilities();
export const ContentTypeHelpers = opticEngine.com.useoptic.diff.interactions.ContentTypeHelpers();
export const OasProjectionHelper = opticEngine.com.useoptic.OASProjectionHelper();


export const DiffManagerFacade = opticEngine.com.useoptic.DiffManagerFacade()

import {checkDiffOrUnrecognizedPath} from './check-diff';
import {IHttpInteraction} from './domain-types/optic-types';

export {
  checkDiffOrUnrecognizedPath
};

export * from './domain-types/optic-types';
