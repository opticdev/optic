export const schema = `
schema {
  query: Query
}
type Query {
  request: [HttpRequest]
  shapeChoices(shapeId: ID): [OpticShape]
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