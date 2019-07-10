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

{ALL_EVENTS}

## Commands
If you're building tools on the Seamless Spec, you directly interface with the Domain Engine using commands. While events are derived by answering the question "What can we say about a REST API?", commands are derived by asking the question "What do we want to do with our API spec?". Maybe we want to delete an entire set of requests, or change every query parameter named 'foo' -> 'bar'. The Domain Engine is then responsible for translating that intent into the events that codify the intent.

{ALL_COMMANDS}
 