
export interface IArbitraryData {
  asShapeHashBytes: (IShapeHashBytes | null)
  asJsonString: (string | null)
  asText: (string | null)
}
       

export interface IGroupingIdentifiers {
  agentGroupId: string
  captureId: string
  agentId: string
  batchId: string
}
       

export interface IShapeHashBytes {
  bytes: number[]
}
       

export interface IHttpInteractionTag {
  name: string
  value: string
}
       

export interface IHttpInteraction {
  uuid: string
  request: IRequest
  response: IResponse
  tags: IHttpInteractionTag[]
}
       

export interface IResponse {
  statusCode: number
  headers: IArbitraryData
  body: IBody
}
       

export interface ICapture {
  groupingIdentifiers: IGroupingIdentifiers
  batchItems: IHttpInteraction[]
}
       

export interface IRequest {
  host: string
  method: string
  path: string
  query: IArbitraryData
  headers: IArbitraryData
  body: IBody
}
       

export interface IBody {
  contentType: (string | null)
  value: IArbitraryData
}
       