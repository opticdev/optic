// Types
export interface IRequest {
  host: string;
  method: string;
  path: string;
  query: IArbitraryData;
  headers: IArbitraryData;
  body: IBody;
}
export interface IResponse {
  statusCode: number;
  headers: IArbitraryData;
  body: IBody;
}
export interface IBody {
  contentType: string | null;
  value: IArbitraryData;
}
export interface IArbitraryData {
  shapeHashV1Base64: string | null;
  asJsonString: string | null;
  asText: string | null;
}
export interface IHttpInteraction {
  uuid: string;
  request: IRequest;
  response: IResponse;
  tags: IHttpInteractionTag[];
}
export interface IGroupingIdentifiers {
  agentGroupId: string;
  captureId: string;
  agentId: string;
  batchId: string;
}
export interface IHttpInteractionTag {
  name: string;
  value: string;
}
export interface IInteractionBatch {
  groupingIdentifiers: IGroupingIdentifiers;
  batchItems: IHttpInteraction[];
}

// Utility functions
// There is a potential to capture invalid interactions - once this is captured, it's in the user's
// system until they clear their captures folder. If we introduce bugs in our capture, we can filter them out here
// Ideally, we should catch these and not have captures that are invalid
const isArbitraryDataNull = (value: IArbitraryData): boolean => {
  return (
    value.asJsonString === null &&
    value.asText === null &&
    value.shapeHashV1Base64 === null
  );
};

export const isValidHttpInteraction = (
  interaction: IHttpInteraction
): boolean => {
  if (
    interaction.request.body.contentType !== null &&
    isArbitraryDataNull(interaction.request.body.value)
  ) {
    return false;
  }
  if (isArbitraryDataNull(interaction.response.body.value)) {
    return false;
  }

  return true;
};
