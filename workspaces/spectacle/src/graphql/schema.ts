export const schema = `
scalar JSON
schema {
  query: Query
  mutation: Mutation
}
type Mutation {
  applyCommands(commands: [JSON]): AppliedCommandsResult
  startDiff(diffId: ID, captureId: ID): StartDiffResult
}
type AppliedCommandsResult {
  batchCommitId: ID
}
type StartDiffResult {
  notificationsUrl: String
  listDiffsQuery: String
  listUnrecognizedUrlsQuery: String
}
type Query {
  requests: [HttpRequest]
  shapeChoices(shapeId: ID): [OpticShape]
  endpointChanges(sinceBatchCommitId: String): EndpointChanges
  batchCommits: [BatchCommit]
  diff(diffId: ID): DiffState
}
type DiffState {
  diffs: JSON
  unrecognizedUrls: JSON
}
type HttpBody {
  contentType: String
  rootShapeId: String
}
type HttpRequest {
  id: ID
  pathComponents: [PathComponent]
  absolutePathPattern: String
  absolutePathPatternWithParameterNames: String
  pathId: ID
  method: String
  bodies: [HttpBody]
  responses: [HttpResponse]
  changes(sinceBatchCommitId: String): ChangesResult
  pathContributions: JSON
  requestContributions: JSON
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
  changes(sinceBatchCommitId: String): ChangesResult
  contributions: JSON
}
type ObjectFieldMetadata {
  name: String
  fieldId: ID
  # query shapeChoices(shapeId) to recurse
  changes(sinceBatchCommitId: String): ChangesResult
  shapeId: ID
  contributions: JSON
}
type ObjectMetadata {
  fields: [ObjectFieldMetadata]
}
type ArrayMetadata {
  # query shapeChoices(shapeId) to recurse
  changes(sinceBatchCommitId: String): ChangesResult
  shapeId: ID
}
type OpticShape {
  id: ID
  jsonType: String
  asObject: ObjectMetadata
  asArray: ArrayMetadata
  # changes(sinceBatchCommitId: String): ChangesResult
  # exampleValue: [JSON]
}
type ChangesResult {
  added: Boolean
  changed: Boolean
}
type EndpointChanges {
  opticUrl: String
  endpoints: [EndpointChange]
}
type EndpointChange {
  change: EndpointChangeMetadata
  pathId: String
  path: String
  method: String
  contributions: JSON
}
type EndpointChangeMetadata {
  category: String
}
type BatchCommit {
  createdAt: String
  batchId: String
  commitMessage: String
}
`;
