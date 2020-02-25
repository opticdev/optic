
export interface IBody {
  asText?: string
  asForm?: string[]
  asJsonString?: string
}
       

export interface IGroupingIdentifiers {
  agentGroupId: string
  captureId: string
  agentId: string
  batchId: string
}
       

export interface ICapture {
  groupingIdentifiers: IGroupingIdentifiers
  batchItems: IApiInteraction[]
}
       

export interface IHeader {
  name: string
  value: string
}
       

export interface IRequest {
  host: string
  method: string
  path: string
  queryString: string
  headers: IHeader[]
  body: IBody
}
       

export interface IResponse {
  statusCode: number
  headers: IHeader[]
  body: IBody
}
       

export interface IApiInteraction {
  uuid: string
  request: IRequest
  response: IResponse
  omitted: string[]
}
       