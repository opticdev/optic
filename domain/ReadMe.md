# Optic API Specification
> A CQRS inspired interface for OpenAPI/Swagger

What if API specs weren't just giant YAML files? 

What is instead they offered:
- Great experiences, optimized for developer productivity and happiness
- Built-in change-logs
- A better set of abstractions like Generics and inheritance
- Stability (no breaking changes...ever)
- Easy ways for other API tools to query them for the data they need

CQRS and Event Sourcing enables us to break free of using a single file, with a complicated schema, to represent our APIs and domains. With the Optic spec you can optimize for each concern independently, making the spec great for API designers, API consumers, and API tooling. 

## [Read the Spec](spec.md)
## [Try the Spec in our API Designer](https://design.useoptic.com)

## Motivation
Specifications or 'specs' describe the behavior of a piece of software specifically and with precision. The most useful specs for programmers are the ones that can be read by both a machine and a human. 

API specifications describe the interface of a program that can be accessed over the wire. Contemporary examples include an OpenAPI file, a protobuf definition, or graphQL schemas. They should ideally be:

- Simple for humans to work with and provide a great developer experience.
- Faithfully encode the interface of the API they describe.
- Representative of the domain with rich abstractions that are useful for the task at hand (design, code generation, doc gen).
- Stable. Breaking changes in complex specification are expensive for users and toolmakers to work with.
- Easy for tooling built on the spec to query the data they need. The interface should be stable for many years and the domain logic should not have to be replicated in tooling itself.

### Retiring an old idea

One of the principle assumptions baked into every competing API specification today is that the specs must be persisted in a human readable, machine readable, and human writable format. In practice, this ends up taking the form of one large YAML or JSON file.

Finding a healthy intersection of these three competing concerns is difficult to achieve and riddled with tradeoffs. Here are some important examples: 

- **Human** **Readability tradeoff:** APIs are naturally represented as graphs. Don't believe us? Control-f and count how many times "$ref" occurs in your spec. It is difficult for humans to read a graph in linear text form, so API spec standards use trees to better communicate structure and relationships.
    - **Impact on machine readability:** This puts a huge burden on each toolmaker to resolve the $refs and rebuild a graph before anything interesting can be done with your spec.
- **Human** **Writability tradeoff:** There are shorthands throughout spec standards today that try to make them easier to author. Examples include keywords that define authentication patterns and the use of $refs to aid in DRY (don't repeat yourself).
    - **Impact on machine readability:** When the specification is not explicit and contains shorthands like 'oauth' for auth or other semantics that are defined by the spec standards themselves, tools need to stay and current and re-implement the domain logic on their own.
    - **Impact on human readability:** API specs today are hard to read because of the very features that make them more writable. Seeing that a response is $ref: OrderType means I have to find OrderType, the three other types referenced there, and then build the flattened schema in my head.
- **Machine Readability tradeoff:** To make an API specification readable by machines, they must use a strict syntax (JSON or YAML) and conform to a tightly specified schema.
    - **Impact on human readability:** JSON is not easy to read, especially when it is 10k + lines.
    - **Impact on human writability:** Nobody is born writing YAML or with perfect intuition about an API spec standard. Even experts spend a lot of time fighting the tooling.

> This shape of this problem means that you can not solve it with ordinary thinking.  The more you optimize for writability, the more difficult you are going to make machine and human readability. The better it is made for machines and tooling, the worse off it is for humans to write.

### CQRS to the rescue

Through this lens, the root problem with current spec standard becomes obvious. there is only one model that is used for both reading and writing, and it also has to support the needs of both humans and machines. We can all agree that is a lot to realistically expect from a single data model. 

We need models optimized for:

- **Human Readability**: so programmers can easily read and understand the API being specced.
- **Human** **Writability:** so programmers can quickly write and modify the spec with productive abstractions.
- **Machine Readability:** so tools can query the information in the spec relevant to them, ideally with something like graphQL.

But how can we get all 3 of those at once? 

Enter CQRS (command-query-responsibility-segregation). [Microsoft's docs explain that CQRS](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs) "separates reads and writes into separate models, using commands to update data, and queries to read data." 

Once we sketched out an API spec built around the principles of CQRS and Event Sourcing, things quickly fell into place. Separating concerns allowed us to optimize each use case without introducing tradeoffs. 

New designs and rethinking old norms change the shape of a problem space in a way that allows real progress. 

### Making it concrete

At the center of our implementation is the open source Optic domain engine. It can run on the JVM or in Node making it portable just about everywhere. At a high level, the domain engine interprets commands and handles queries. You can think of this as sort of a living specification. Instead of being a flat file, it is an actual program that answers your queries and modifies the internal API specification in response to your commands. This internal API specification is an event stream of every change you have made to your API since you started using Optic. These events are played back every time you start the domain engine to build the current specification for your API. Each of these events are immutable facts about the API like RequestAdded, RequestBodyContentTypeSet, etc. We do not have to argue over syntax, semantics, or structure or even concern ourselves with humans reading or writing these directly. Events are pure descriptions of the API domain. 

Commands for the API spec domain might be things like AddQueryParameter, CreatePath, ChangeMethod, UseSchema, AddResponse, etc. It would not be very human-friendly to make a programmer write all the commands in sequence, so we have also shipped an open source API Design tool similar to Stoplight or RedHat's Apicurio. The Optic API designer sends commands to the domain engine in response to actions taken in the UI. Visual OpenAPI designers are exploding right now. It seems inevitable that most teams will adopt one, especially as the OpenAPI format becomes more complex.

### [Try Designer](https://design.useoptic.com)

### Query what you need

In CQRS, queries return projections (custom read models that are highly optimized for a specific use case). Some example projections might be:

- A list of endpoints 
    — That is all you get. There is nothing you do not need.
- A list of schemas / types
    - Represented as a list of rules (great for building a test suite).
    - with all their references flattened.
    - as JSON schema.
- Your API represented in OpenAPI 
    — A traditional spec format is just another projection of the core data model. Even some of Optic's more advanced features, such as support for Generics, can be projected onto OpenAPI.
- the changes made since the last version of the API.
- a projection optimized for generating
    - clients.
    - API implementations.
    - test suites.
    - make your own.

Because these queries are based on the event stream used for persistence, they are guaranteed to be stable for two reasons: 

- As a tool-builder, you can in-source the queries and projections you need to your own codebase. Imagine if OpenAPI was structured in a way that mapped more cleanly onto the domain of the tools you are building for it, forever, guaranteed.
- We will not accept breaking changes to projections in the main project. If you need to change the projection in a breaking way, you will be asked to name the query something else.

### Benefits

We just unpacked a lot about the architecture, now let us discuss the practical value of representing our APIs in this way. 

#### Developer Experience

Optic both enables and requires better API design tools because nobody is running the commands manually. The market is already moving towards structured API editors, and the battle is on to improve developer experience. Once you strip away the complexity of parsing and mutating a traditional API spec, your team can focus on building a great UX (see our editor and its source as an example).

Optic also makes it possible to imagine an explosion of specialized tooling built around the API design experience. Because of the way projections and commands work, a bunch of really awesome Schema Editors could be built that only concern themselves with relevant events/commands. Tooling for generating tests could built around their own set of specialized events/commands. With this architecture, it is fine if tools only concern themselves queries and commands relevant to their domain.

#### Richer Abstractions

With concerns separated properly, it is easier to implement richer abstractions to represent APIs. Many API architects want to define reusable standards for things like pagination, but this is not easily supported by JSON Schema. In Optic, it is easy for us to support generics. Now our schemas can take other schemas as type parameters like `InfiniteScrollPagination[UserType]` or `PageBasedPagination[UserType]`. Generics make API standards sharable between a team's APIs.

A major unsolved challenge in OpenAPI-land is diffing a spec. Proper diffs would help prevent breaking changes, generate semantic change-logs, and provide safety for teams that use code-first workflows. One of the main challenges here, besides the complex data structure, is that changes to a flat JSON/YAML file lose their intent. How can you know a query parameter was renamed 'foo' → 'bar'? A normal diff of the JSON would show 'foo' being deleted and 'bar' being added. 

In Optic, every change is an event that captures intent, so you can easily build a semantic diff as a projection. In fact, there is an open feature request that displays changes to the API spec whenever you pull the repo. 

Finally, in the real world, teams are using a combination of REST, graphQL, Websockets, and RPCs, often times within the same APIs. A traditional spec combining all these paradigms would collapse under the weight of its own complexity, but it is possible for Optic to support multiple paradigms and common components between them. We suspect this kind of interoperability will become more important in the next few years, especially in enterprise settings. 

#### Governance

The way Optic' domain is set up means that contributors just have to answer one question "What can we say about a REST API?"

If it can have requests, then we need an event for RequestAdded.

If each request can have query parameters, then we need an event for QueryParameterAdded. 

If each query parameter can have a shape, then we need ParameterShapeSet.

Do we need to support generics? That's just 2 new events and 1 query. 

Keeping the domain simple, representative, and pure is the most important task for us, and that is much easier for a group of contributors to manage compared to a traditional spec standard.

Once the domain modeling is taken care of, the needs of toolmakers will direct the development of the Commands and Queries that get built. 

### Tradeoffs

There are some clear tradeoffs to this design as well. 

- Optic relies on GUI API Designers to be built around it. We have shipped an awesome open-source one to get things started, but we need more competitive solutions to grow and evolve in parallel.
- Thinking in CQRS is hard. Contributors who are unfamiliar with the concepts will have to invest their time and mental energy in learning. However, thinking in OpenAPI, RAML, or API Blueprint is also difficult. We think it is easier to ask a small group of contributors to learn CQRS so that the millions of developers who need to design their APIs can benefit from better tooling.
- While CQRS naturally supports collaborative editing, the infrastructure needed to distribute events across clients is complex and relies on eventual consistency. Microsoft does a good job of explaining the tradeoffs of using [CQRS to represent your data here](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs).
