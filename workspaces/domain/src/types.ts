export interface IHeaders {
  [key: string]: string | string[] | undefined
}

export interface IParameterMapping {
  [key: string]: string
}

export interface IMultiParameterMapping {
  [key: string]: string | string[]
}

export interface IRequestMetadata {
  url: string
  method: string
  headers: IHeaders
  queryString?: string
  cookies: IParameterMapping
  queryParameters: IMultiParameterMapping
  body?: any
}

export interface IResponseMetadata {
  statusCode: number
  headers: IHeaders
  body?: object | string
}

export interface IApiInteraction {
  id: string
  host: string
  request: IRequestMetadata
  response: IResponseMetadata
}
