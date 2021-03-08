export const schema = `
schema {
  query: Query
}
type Query {
  request: [HttpRequest]
}
type HttpBody {
  contentType: String
  rootShapeId: String
}
type HttpRequest {
  pathComponents: [PathComponent]
  absolutePathPattern: String
  method: String
  body: [HttpBody]
  response: [HttpResponse]
}
type PathComponent {
  opticId: ID
  name: String
  isParameterized: Boolean
}
type HttpResponse {
  statusCode: Int
  body: [HttpBody]
}`;