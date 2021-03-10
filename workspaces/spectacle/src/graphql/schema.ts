export const schema = `
schema {
  query: Query
}
type Query {
  requests: [HttpRequest]
  shapeChoices(shapeId: ID): [OpticShape]
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
  key: String
  fieldId: ID
  shapeId: [ID]
  required: Boolean
}
type ObjectMetadata {
  field: [ObjectFieldMetadata]
}
type ArrayItemMetadata {
  shapeId: [ID]
}
type ArrayMetadata {
  item: [ArrayItemMetadata]
}
type OpticShape {
  id: ID
  jsonType: String
  asObject: ObjectMetadata
  asArray: ArrayMetadata
  # exampleValue: [JSON]
}

`;