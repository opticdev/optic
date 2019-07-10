# Seamless API Specifications 
The Seamless API Specification describes the behaviors and evolution of Restful APIs. 

**Persistence**: An immutable event stream is used to store a sequence of every change made to an API throughout its history. These events can be stored in a database or saved as a JSON array in a single file.   

**Domain Engine**: This project contains the domain engine that powers the Seamless Spec. The domain is responsible for handling commands, persisting events, and responding to queries. It is fully open source, and can run in Node or the JVM.    


The spec relies on the CQRS pattern to separate the read models from write models. By separating the concerns of making a spec human readable, human writable and machine readable, CQRS enables the Seamless spec to provide optimised experiences across the board.  

Further Reading:
- Domain driven design
- Command Query Responsibility Segregation (CQRS)
- Event Sourcing


### Reading From the Spec
The events can be played back to build a projection of the API's current defined behavior. 

Other projections can be built that are optimized for any number of different use cases such as generating documentation, client SDKs, API code and tests. 

### Updating the Spec
To update a spec, users or API tools, must send commands into the Domain Engine. These commands may be rejected if they aren't compatible with the current state of the API. For instance, the Domain Engine will not allow you to reference a shape that does not exist. 

Commands that are accepted will have the side effect of adding events to the event stream, and by extension, update certain projections.


## Domain Overview
Today the Seamless Spec concerns itself with two domains:

**Data Types** - Representations of the concepts in your (the API author's) domain. These might be concepts like `Users`, `Articles`, `Orders`, etc. Concepts have shapes, which describe the properties of each concept. The shape for `Users` may define fields for `email` and `password`.

**Requests** - The behaviors of Restful APIs. This domain concerns itself with paths, methods, parameters, request bodies, responses, and response bodies. 

## Events
Because the spec does not concern itself with any usability concerns (those live in commands and queries), contributors just have to answer one question "What can we say about a REST API?". For example, maybe we can add query parameters, or change the content type of a response body. 

The following events are our answers to that question, and they represent what is currently supported by the Domain Engine. If there are more things you'd like the spec to "say about a REST API", propose new events in this repo's issues. 


### Requests Domain

#### PathComponentAdded

Adds a new component to path tree

pathId: `PathComponentId`, parentPathId: `PathComponentId`, name: `String`

#### PathComponentRemoved

Removes a path component

pathId: `PathComponentId`

#### PathComponentRenamed

Renames a path component

pathId: `PathComponentId`, name: `String`

#### PathParameterAdded

Adds a path parameter component to path tree

pathId: `PathComponentId`, parentPathId: `PathComponentId`, name: `String`

#### PathParameterRemoved

Removes a path parameter

pathId: `PathComponentId`

#### PathParameterRenamed

Renames a path parameter

pathId: `PathComponentId`, name: `String`

#### PathParameterShapeSet

Changes the shape of a path parameter

pathId: `PathComponentId`, shapeDescriptor: `ShapedRequestParameterShapeDescriptor`

#### RequestAdded

Adds a new request to a path

requestId: `RequestId`, pathId: `PathComponentId`, httpMethod: `String`

#### RequestBodySet

Adds a request body to a request

requestId: `RequestId`, bodyDescriptor: `ShapedBodyDescriptor`

#### RequestBodyUnset

Removes a request body from a path

requestId: `RequestId`

#### RequestParameterAdded

Adds a parameter to a request

parameterId: `RequestParameterId`, requestId: `PathComponentId`, parameterLocation: `String`, name: `String`

#### RequestParameterRemoved

Removes a parameter from its request

parameterId: `RequestParameterId`

#### RequestParameterRenamed

Renames a parameter

parameterId: `RequestParameterId`, name: `String`

#### RequestParameterShapeSet

Changes the shape of a parameter

parameterId: `RequestParameterId`, parameterDescriptor: `ShapedRequestParameterShapeDescriptor`

#### RequestParameterShapeUnset

Unsets the shape of the parameter

parameterId: `RequestParameterId`

#### RequestRemoved

Removes a request

requestId: `RequestId`

#### ResponseAdded

Adds a response to a request

responseId: `ResponseId`, requestId: `RequestId`, httpStatusCode: `Int`

#### ResponseBodySet

Adds a response body

responseId: `ResponseId`, bodyDescriptor: `ShapedBodyDescriptor`

#### ResponseBodyUnset

Removes a response's body

responseId: `ResponseId`

#### ResponseRemoved

Removes a response from a request

responseId: `ResponseId`

#### ResponseStatusCodeSet

Changes the status code of a response

responseId: `ResponseId`, httpStatusCode: `Int`

### Data Types Domain

#### ChildOccurrenceUpdated

Marks a shape is optional in the context of its parent

id: `FieldId`, parentId: `ConceptId`, to: `Boolean`, conceptId: `ConceptId`

#### ConceptDefined

Adds a new concept with the specified name

name: `String`, root: `String`, id: `ConceptId`

#### ConceptDeprecated

Tags a concept as deprecated.

conceptId: `ConceptId`

#### ConceptNamed

Changes the name of a concept

newName: `String`, conceptId: `ConceptId`

#### FieldAdded

Adds a field to an object shape

parentId: `String`, id: `FieldId`, conceptId: `ConceptId`

#### FieldNameChanged

Changes the name of a field

id: `FieldId`, newName: `String`, conceptId: `ConceptId`

#### FieldRemoved

Removes a field

id: `FieldId`, conceptId: `ConceptId`

#### InlineConceptDefined

Defines an inline concept (concepts without names that can't be referenced)

root: `String`, conceptId: `ConceptId`

#### TypeAssigned

Changes the type to the assigned type

id: `String`, to: `PrimitiveType`, conceptId: `ConceptId`

#### TypeParameterAdded

Adds a type parameter

parentId: `FieldId`, id: `TypeParameterId`, conceptId: `ConceptId`

#### TypeParameterRemoved

Removes a type parameter

id: `TypeParameterId`, conceptId: `ConceptId`


## Commands
If you're building tools on the Seamless Spec, you directly interface with the Domain Engine using commands. While events are derived by answering the question "What can we say about a REST API?", commands are derived by asking the question "What do we want to do with our API spec?". Maybe we want to delete an entire set of requests, or change every query parameter named 'foo' -> 'bar'. The Domain Engine is then responsible for translating that intent into the events that codify the intent.


### Requests Domain

#### AddHeaderParameter

parameterId: `RequestParameterId`, requestId: `RequestId`, name: `String`

#### AddPathComponent

pathId: `PathComponentId`, parentPathId: `PathComponentId`, name: `String`

#### AddPathParameter

pathId: `PathComponentId`, parentPathId: `PathComponentId`, name: `String`

#### AddQueryParameter

parameterId: `RequestParameterId`, requestId: `RequestId`, name: `String`

#### AddRequest

requestId: `RequestId`, pathId: `PathComponentId`, httpMethod: `String`

#### AddResponse

responseId: `ResponseId`, requestId: `RequestId`, httpStatusCode: `Int`

#### RemoveHeaderParameter

parameterId: `RequestParameterId`

#### RemovePathComponent

pathId: `PathComponentId`

#### RemovePathParameter

pathId: `PathComponentId`

#### RemoveQueryParameter

parameterId: `RequestParameterId`

#### RemoveRequest

requestId: `RequestId`

#### RemoveResponse

responseId: `ResponseId`

#### RenameHeaderParameter

parameterId: `RequestParameterId`, name: `String`

#### RenamePathComponent

pathId: `PathComponentId`, name: `String`

#### RenamePathParameter

pathId: `PathComponentId`, name: `String`

#### RenameQueryParameter

parameterId: `RequestParameterId`, name: `String`

#### SetHeaderParameterShape

parameterId: `RequestParameterId`, parameterDescriptor: `ShapedRequestParameterShapeDescriptor`

#### SetPathParameterShape

pathId: `PathComponentId`, shapedRequestParameterShapeDescriptor: `ShapedRequestParameterShapeDescriptor`

#### SetQueryParameterShape

parameterId: `RequestParameterId`, parameterDescriptor: `ShapedRequestParameterShapeDescriptor`

#### SetRequestBodyShape

requestId: `RequestId`, bodyDescriptor: `ShapedBodyDescriptor`

#### SetResponseBodyShape

responseId: `ResponseId`, bodyDescriptor: `ShapedBodyDescriptor`

#### SetResponseStatusCode

responseId: `ResponseId`, httpStatusCode: `Int`

#### UnsetHeaderParameterShape

parameterId: `RequestParameterId`

#### UnsetQueryParameterShape

parameterId: `RequestParameterId`

#### UnsetRequestBodyShape

requestId: `RequestId`

#### UnsetResponseBodyShape

responseId: `ResponseId`

### Data Types Domain

#### AddField

parentId: `String`, id: `FieldId`, conceptId: `ConceptId`

#### AddTypeParameter

parentId: `String`, id: `TypeParameterId`, conceptId: `ConceptId`

#### AssignType

id: `ShapeId`, to: `PrimitiveType`, conceptId: `ConceptId`

#### DefineConcept

name: `String`, rootId: `String`, conceptId: `ConceptId`

#### DefineInlineConcept

rootId: `String`, conceptId: `ConceptId`

#### DeprecateConcept

conceptId: `ConceptId`

#### RemoveField

id: `FieldId`, conceptId: `ConceptId`

#### RemoveTypeParameter

id: `TypeParameterId`, conceptId: `ConceptId`

#### SetConceptName

newName: `String`, conceptId: `ConceptId`

#### SetFieldName

id: `FieldId`, newName: `String`, conceptId: `ConceptId`

#### UpdateChildOccurrence

id: `FieldId`, parentId: `ShapeId`, to: `Boolean`, conceptId: `ConceptId`

 