export const schema = `
schema {
  query: Query
}
type Query {
  request: [HttpRequest]
}
type HttpBody {
  id: String
  contentType: String
  rootShapeId: String
}
type HttpRequest {
  id: ID
  pathComponents: [PathComponent]
  absolutePathPattern: String
  pathId: ID
  method: String
  body: [HttpBody]
  response: [HttpResponse]
}
type PathComponent {
  id: ID
  name: String
  isParameterized: Boolean
}
type HttpResponse {
  id: ID
  statusCode: Int
  body: [HttpBody]
}`;
