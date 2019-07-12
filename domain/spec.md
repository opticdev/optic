# Seamless API Specifications 
The Seamless API Specification describes the evolution of HTTP APIs. The spec relies on the Command Query Responsibility Segregation (CQRS) pattern. 

Typically specs try to achieve the goals of human and machine readability and writability in one representation. These representations rarely service any of these concerns optimally leading to a sub-par experience for developers.   

By separating these concerns, CQRS enables the Seamless spec to provide optimized experiences across the board. The spec provides commands that encapsulate the ways in which we intend for the specification to change, and queries encapsulate the questions we wish to answer about the specification. 

**How does the Seamless persist an API's spec?**: An immutable event stream is used to store a sequence of every change made to an API throughout its history. Each of these facts can be stored in a database or saved as a JSON array in a single file.   

**Domain Engine**: This repository contains the domain engine that powers the Seamless Spec. The domain is responsible for handling commands, persisting facts, and responding to queries. It is fully open source, and can run in Node or the JVM.    

> If some of these concepts are new to you, consider reading more about the following topics: Domain driven design, Command Query Responsibility Segregation (CQRS), Event Sourcing

### Reading From the Spec
The facts can be played back to build a projection of the API's current defined behavior. 

Other projections can be built that are optimized for any number of different use cases such as generating documentation, client SDKs, API code and tests. 

### Updating the Spec
To update a spec, users or API tools, must send commands into the Domain Engine. These commands may be rejected if they aren't compatible with the current state of the API. For instance, the Domain Engine will not allow you to reference a shape that does not exist. 

Commands that are accepted will have the side effect of adding new facts to the event stream, and by extension, update certain projections.


## Domain Overview
Today the Seamless Spec concerns itself with two domains:

**Data Types** - Representations of the concepts in your (the API author's) domain. These might be concepts like `Users`, `Articles`, `Orders`, etc. Concepts have shapes, which describe the properties of each concept. The shape for `Users` may define fields for `email` and `password`.

**Requests** - The behaviors of Restful APIs. This domain concerns itself with paths, methods, parameters, request bodies, responses, and response bodies. 

## Facts
Because the spec does not concern itself with any use cases (those live in commands and queries), contributors just have to answer one question "What can we say about an HTTP API?". For example, maybe there can be query parameters, or response bodies with content types. 

The following types of facts are our answers to that question, and they represent what is currently supported by the Domain Engine. If there are more things you'd like the spec to "say about an HTTP API", propose new facts in this repo's issues. 


### Requests Domain

#### PathComponentAdded

A path component has been added

pathId: `PathComponentId`, parentPathId: `PathComponentId`, name: `String`

#### PathComponentRemoved

A path component has been removed

pathId: `PathComponentId`

#### PathComponentRenamed

A path component has been renamed

pathId: `PathComponentId`, name: `String`

#### PathParameterAdded

A path parameter has been added

pathId: `PathComponentId`, parentPathId: `PathComponentId`, name: `String`

#### PathParameterRemoved

A path parameter was removed

pathId: `PathComponentId`

#### PathParameterRenamed

A path parameter was renamed

pathId: `PathComponentId`, name: `String`

#### PathParameterShapeSet

A path parameter shape has been changed

pathId: `PathComponentId`, shapeDescriptor: `ShapedRequestParameterShapeDescriptor`

#### RequestAdded

A request was added

requestId: `RequestId`, pathId: `PathComponentId`, httpMethod: `String`

#### RequestBodySet

A request body was specified

requestId: `RequestId`, bodyDescriptor: `ShapedBodyDescriptor`

#### RequestBodyUnset

A request body was removed

requestId: `RequestId`

#### RequestParameterAdded

A request parameter was added

parameterId: `RequestParameterId`, requestId: `PathComponentId`, parameterLocation: `String`, name: `String`

#### RequestParameterRemoved

A request parameter has been removed

parameterId: `RequestParameterId`

#### RequestParameterRenamed

A request parameter has been renamed

parameterId: `RequestParameterId`, name: `String`

#### RequestParameterShapeSet

A request parameter shape has been changed

parameterId: `RequestParameterId`, parameterDescriptor: `ShapedRequestParameterShapeDescriptor`

#### RequestParameterShapeUnset

A request parameter shape was removed

parameterId: `RequestParameterId`

#### RequestRemoved

A request was removed

requestId: `RequestId`

#### ResponseAdded

A response was added to a request

responseId: `ResponseId`, requestId: `RequestId`, httpStatusCode: `Int`

#### ResponseBodySet

A response body was specified

responseId: `ResponseId`, bodyDescriptor: `ShapedBodyDescriptor`

#### ResponseBodyUnset

A response body was removed

responseId: `ResponseId`

#### ResponseRemoved

A response was removed

responseId: `ResponseId`

#### ResponseStatusCodeSet

A response's status code was changed

responseId: `ResponseId`, httpStatusCode: `Int`

### Data Types Domain

#### ChildOccurrenceUpdated

A shape is optional in the context of its parent

id: `FieldId`, parentId: `ConceptId`, to: `Boolean`, conceptId: `ConceptId`

#### ConceptDefined

There is a concept with $name

name: `String`, root: `String`, id: `ConceptId`

#### ConceptDeprecated

A concept has been deprecated

conceptId: `ConceptId`

#### ConceptNamed

A concept has been renamed to $newName

newName: `String`, conceptId: `ConceptId`

#### FieldAdded

A field has been added to object

parentId: `String`, id: `FieldId`, conceptId: `ConceptId`

#### FieldNameChanged

A field has been renamed

id: `FieldId`, newName: `String`, conceptId: `ConceptId`

#### FieldRemoved

A field has been removed

id: `FieldId`, conceptId: `ConceptId`

#### InlineConceptDefined

An inline concept has been defined

root: `String`, conceptId: `ConceptId`

#### TypeAssigned

A shape's type has been changed

id: `String`, to: `PrimitiveType`, conceptId: `ConceptId`

#### TypeParameterAdded

A type parameter has been added

parentId: `FieldId`, id: `TypeParameterId`, conceptId: `ConceptId`

#### TypeParameterRemoved

A type parameter has been removed

id: `TypeParameterId`, conceptId: `ConceptId`


## Commands
If you're building tools on the Seamless Spec, you directly interface with the Domain Engine using commands. While facts are derived by answering the question "What can we say about an HTTP API?", commands are derived by asking the question "What do we want to do with our API spec?". Maybe we want to delete an entire set of requests, or change every query parameter named 'foo' -> 'bar'. The Domain Engine is then responsible for translating that intent into the facts that codify the changes.


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

 