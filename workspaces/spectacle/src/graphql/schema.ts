export const schema = `
schema {
  query: Query
}
type Query {
  requests: [HttpRequest]
  shapeChoices(shapeId: ID): [OpticShape]
  endpointChanges(since: String): EndpointChanges
  batchCommits: [BatchCommit]
}
type HttpBody {
  contentType: String
  rootShapeId: String
}
type HttpRequest {
  id: ID
  pathComponents: [PathComponent]
  absolutePathPattern: String
  pathId: ID
  method: String
  bodies: [HttpBody]
  responses: [HttpResponse]
}
type PathComponent {
  id: ID
  name: String
  isParameterized: Boolean
}
type HttpResponse {
  id: ID
  statusCode: Int
  bodies: [HttpBody]
}
type ObjectFieldMetadata {
  name: String
  fieldId: ID
  # query shapeChoices(shapeId) to recurse
  shapeId: ID
}
type ObjectMetadata {
  fields: [ObjectFieldMetadata]
}
type ArrayMetadata {
  # query shapeChoices(shapeId) to recurse
  shapeId: ID
}
type OpticShape {
  id: ID
  jsonType: String
  asObject: ObjectMetadata
  asArray: ArrayMetadata
  # exampleValue: [JSON]
}
type EndpointChanges {
  opticUrl: String
  endpoints: [EndpointChange]
}
type EndpointChange {
  change: EndpointChangeMetadata
  path: String
  method: String
}
type EndpointChangeMetadata {
  category: String
}
type BatchCommit {
  createdAt: String
  batchId: String
}
`;