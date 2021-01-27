---
date: "9/23/2020"
title: "Building a Better API Specification"
author: Aidan Cunniffe
author_url: "https://github.com/acunniffe"
author_image_url: "/img/team/aidan.jpg"
category: Engineering
---

## Part 1 of our Changelog Specification Series

> We've had several other API tools engage us about using the Optic Changelog Spec in their products so we're going back to the basics with a repost from our July 8th, 2019 [Problems with API Specifications](https://medium.com/seamless-blog/problems-with-api-specifications-690be2c30f29). This is where Dev and I first shared Changelogs specs publicly :) Enjoy!

It's been over a year since Dev first came up with the idea to apply CQRS / Event Sourcing to modeling API behavior, and the idea has proven to be very robust. Since publishing the original form of this article, Optic has pivoted from a GUI for API contracts, to a code generator, then to an API spec generator, and finally to the "Git for APIs" tool that it is today. Don't worry -- you've shown us it's working, and we're sticking with it. No big pivots ahead.

<!--truncate-->

Most recently we ported all our domain logic from Scala -> Rust (going live in Optic 9). What might surprise you is that for all of these use cases, the Changelog spec we initially described in July of last year has been the one thing that never changed. The projections and commands that support each of those use cases vary wildly, but having the Changelog spec is one of the things that allowed our small team to explore so much ground as quickly as we did. Without the velocity this afforded us, we would not have found the right approach to long-standing challenges in the API tooling space as quickly as we did. We hope more teams benefit from the Changelog spec and use our prior work to explore other important problems-to-solve in the API space as well.

But alas, enough reflection, to the post!

---

## Problems with API Specifications
#### By: Aidan Cunniffe & Dev Doshi; Published: July 8th, 2019

When we set out to build better tooling for APIs, one of the first questions we had to ask ourselves was whether we should create our own API specification format or choose to interoperate with an existing standard.

OpenAPI has a lot of momentum and choosing it as the backing representation for Optic seemed to be the de facto “right move.” There was also comic wisdom pushing us towards an existing standard like OpenAPI, RAML, API Builder, or API Blueprint.

![https://xkcd.com/927/](https://cdn-images-1.medium.com/max/2000/0*ACHpG0xQ_ufwImIB.png)

> Modern take: we're so thankful we only chose to export OpenAPI and not try to diff + build a validation proxy around it. Other vendors are trying but from what they've told us, it's too ambiguous to diff effectively, and validation proxies that support multiple past versions or subsets of OpenAPI aren't easy to get right.

## What is a specification?

Before choosing one course over another, we spent time thinking about the problem from first principles.

Specifications or ‘specs’ describe the behavior of a piece of software specifically and with precision. The most useful specs for programmers are the ones that can be read by both a machine and a human.

API specifications describe the interface of a program that can be accessed over the wire. Contemporary examples include an OpenAPI file, a protobuf definition, or graphQL schemas. They should ideally be:

- Simple for humans to work with and provide a great developer experience.
- Faithfully encode the interface of the API they describe.
- Representative of the domain with rich abstractions that are useful for the task at hand (design, code generation, doc gen).
- Stable. Breaking changes in complex specification are expensive for users and toolmakers.
- Easy for tooling built on the spec to query the data they need. The interface should be stable for many years and the domain logic should not have to be replicated in tooling itself.

## Retiring an old idea

One of the principle assumptions baked into every competing API specification today is that the specs must be persisted in a human readable, machine readable, and human writable format. In practice, this ends up taking the form of one large YAML or JSON file.

Finding a healthy intersection of these three competing concerns is difficult to achieve and riddled with tradeoffs. Here are some important examples:

**Human Readability tradeoff**: APIs are naturally represented as graphs. Don’t believe us? Control-f and count how many times “$ref” occurs in your spec. It is difficult for humans to read a graph in linear text form, so API spec standards use trees to better communicate structure and relationships.

 - Impact on machine readability: This puts a huge burden on each toolmaker to resolve the `$refs` and rebuild a graph before anything interesting can be done with your spec.

**Human Writability tradeoff**: There are shorthands throughout spec standards today that try to make them easier to author. Examples include keywords that define authentication patterns, shorthands,  and the use of `$refs` to aid in DRY (don’t repeat yourself).

 - Impact on machine readability: When the specification is not explicit and contains shorthands like ‘readonly’ that are defined by the spec standards themselves, tools need to stay and current and re-implement the domain logic of the spec in their own implementations.

 - Impact on human readability: API specs today are hard to read because of the very features that make them more writable. Seeing that a response is `$ref` `OrderType` means I have to find `OrderType`, the three other types referenced there, and then build the flattened schema in my head.

**Machine Readability tradeoff**: To make an API specification readable by machines, they must use a strict syntax (JSON or YAML) and conform to a tightly specified schema.

 - Impact on human readability: JSON is not easy to read, especially when it is 10k + lines.

 - Impact on human writability: Nobody is born writing YAML or with perfect intuition about an API spec standard. Even experts spend a lot of time fighting the tooling.


Conclusion: This shape of this problem means that you can not solve it with ordinary thinking. The more you optimize for writability, the more difficult you are going to make machine and human readability. The better it is made for machines and tooling, the worse off it is for humans to write.*


> Modern Take: This all checks out. The one thing we missed is that most teams see asking their developers to learn a spec format as a barrier to adopting it. This also creates friction post-adoption against updating to a newer version of the spec format. Costly for them, but equally so for the toolmakers, who now have an additional thing to support. We've never broken the Changelog Spec to date, that's a nice side benefit.

## CQRS to the rescue

Through this lens, the root problem with current spec standard becomes obvious. there is only one model that is used for both reading and writing, and it also has to support the needs of both humans and machines. We can all agree that is a lot to realistically expect from a single data model.

We need models optimized for:

- **Human Readability**: so programmers can easily read and understand the API being spec'd.

- **Human Writability**: so programmers can quickly write and modify the spec with productive abstractions.

- **Machine Readability**: so tools can query the information in the spec relevant to them.

But how can we get all 3 of those at once?

Enter CQRS (command-query-responsibility-segregation). [Microsoft’s docs explain that CQRS](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs) “separates reads and writes into separate models, using commands to update data, and queries to read data.”

Once we sketched out an API spec built around the principles of CQRS and Event Sourcing, things quickly fell into place. Separating concerns allowed us to optimize each use case without introducing tradeoffs.

New designs and rethinking old norms change the shape of a problem space in a way that allows real progress.

## Making it concrete

At the center of our implementation is the open source [Optic domain engine](https://github.com/opticdev/optic). It can run natively (thanks Rust) or in Node making it portable just about everywhere. At a high level, the domain engine interprets commands and handles queries. You can think of this as sort of a living specification. Instead of being a flat file, it is an actual program that answers your queries and modifies the internal API specification in response to your commands. This internal API specification is an event stream of every change you have made to your API since you started using Optic. These events are played back every time you start the domain engine to build the current specification for your API. Each of these events are immutable facts about the API like `RequestAdded`, `RequestBodyContentTypeSet`, etc. We do not have to argue over syntax, semantics, or structure or even concern ourselves with humans reading or writing these directly. Events are facts, the pure descriptions of what happened to this API over time.

Commands for the API spec domain might be things like `AddQueryParameter`, `CreatePath`, `ChangeMethod`, `UseSchema`, `AddResponse`, etc. It would not be very human-friendly to make a programmer write all the commands in sequence, so we have also shipped an open source API Design tool similar to Stoplight or RedHat’s Apicurio. The Optic API designer sends commands to the domain engine in response to actions taken in the UI. Visual OpenAPI designers are exploding right now. It seems inevitable that most teams will adopt one, especially as the OpenAPI format becomes more complex.

![](https://cdn-images-1.medium.com/max/3638/0*MSMFZ27dhfvEQqJz.png)

> Modern Take: Wow that pic is a throwback, Optic looks very different now. See https://demo.useoptic.com

## Query what you need

In CQRS, queries return projections (custom read models that are highly optimized for a specific use case). Some example projections might be:

- A list of endpoints — That is all you get. There is nothing you do not need.

- A list of schemas / types represented as a list of rules (great for building a test suite), with all their references flattened, or as a JSON schema.

- Your API represented in OpenAPI — A traditional spec format is just another projection of the core data model. Even some of Optic’s more advanced features, such as support for Generics, can be projected onto OpenAPI.

- the changes made since the last version of the API.

- projections optimized for generating code

Because these queries are based on the event stream used for persistence, they are guaranteed to be stable for two reasons:

- As a tool-builder, you can in-source the queries and projections you need to your own codebase. Imagine if OpenAPI was structured in a way that mapped more cleanly onto the domain of the tools you are building for it, forever, guaranteed.

- We will not accept breaking changes to projections in the main project. If you need to change the projection in a breaking way, you will be asked to name the query something else.

## Benefits

We just unpacked a lot about the architecture, now let us discuss the practical value of representing our APIs in this way.

### Developer Experience

Optic both enables and requires better API design tools because nobody is running the commands manually. The market is already moving towards structured API editors, and the battle is on to improve developer experience. Once you strip away the complexity of parsing and mutating a traditional API spec, your team can focus on building a great UX (see our editor and its source as an example).

Optic also makes it possible to imagine an explosion of specialized tooling built around the API design experience. Because of the way projections and commands work, a bunch of really awesome Schema Editors could be built that only concern themselves with relevant events/commands. Tooling for generating tests could be built around their own set of specialized events/commands. With this architecture, it is fine if tools only concern themselves with queries and commands relevant to their domain.

### Richer Abstractions


With concerns separated properly, it is easier to implement richer abstractions to represent APIs. Many API architects want to define reusable standards for things like pagination, but this is not easily supported by JSON Schema. In Optic, it is easy for us to support generics. Now our schemas can take other schemas as type parameters like InfiniteScrollPagination[UserType] or PageBasedPagination[UserType]. Generics make API standards shareable between a team’s APIs.

A major unsolved challenge in OpenAPI-land is diffing a spec. Proper diffs would help prevent breaking changes, generate semantic change-logs, and provide safety for teams that use code-first workflows. One of the main challenges here, besides the complex data structure, is that changes to a flat JSON/YAML file lose their intent. How can you know a query parameter was renamed ‘foo’ → ‘bar’? A normal diff of the JSON would show ‘foo’ being deleted and ‘bar’ being added.

Finally, in the real world, teams are using a combination of REST, graphQL, Websockets, and RPCs, often times within the same APIs. A traditional spec combining all these paradigms would collapse under the weight of its own complexity, but it is possible for Optic to support multiple paradigms and common components between them. We suspect this kind of interoperability will become more important in the next few years, especially in enterprise settings.

## Tradeoffs

There are some clear tradeoffs to this design as well.

- Optic relies on GUI API Designers to be built around it. We have shipped an awesome open-source one to get things started, but we need more competitive solutions to grow and evolve in parallel.

- Thinking in CQRS is hard. Contributors who are unfamiliar with the concepts will have to invest their time and mental energy in learning. However, thinking in OpenAPI, RAML, or API Blueprint is also difficult. We think it is easier to ask a small group of contributors to learn CQRS so that the millions of developers who need to design their APIs can benefit from better tooling.

- While CQRS naturally supports collaborative editing, the infrastructure needed to distribute events across clients is complex and relies on eventual consistency. Microsoft does a good job of explaining the tradeoffs of using [CQRS to represent your data here](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs).

## Closing
> *Traditional specifications form communities around the same schema. We would like to imagine with our specification, communities will form around similar jobs.*

Nobody wakes up thinking, “today we are going to build another way to spec APIs.” We certainly did not.

We think a better API spec that enables a whole new ecosystem of tooling is a critical piece of infrastructure, and we are happy to open source our work and give it to the community.

We look forward to hearing your comments, ideas, and concerns and working on ways to incorporate them into the project.


## Modern Takes
These are definitely robust ideas that have served Optic well and made our path towards making APIs developer friendly tractable.

Over the last few months, several other API tooling projects/vendors have expressed interest in being able to answer a lot of the questions that Optic can. There's a lot of powerful ways to utilize spec diffs and traffic diffs, and folks have been cut in the past by changing specifications affecting the fates of their tooling projects.

We are excited to get these ideas out there for others to work with and to continue open sourcing our work as we go!

[Follow us on Twitter](https://twitter.com/useoptic) to make sure you don't miss the next posts in this series:

- Part 1: Building Better Specs
- [Coming Soon] Part 2: Changelog Spec Demo
- [Coming Soon] Part 3: Feedback on the Changelog Spec from the API Community (write me aidan@useoptic.com)
- [Coming Soon] Part 4: The Future of the Changelog Spec

Thanks for reading!

- If you're interested in [trying out Optic. Click here!](https://useoptic.com)
- If you want to [check out our code. See GitHub!](https://github.com/opticdev)
- [Follow us on Twitter](https://twitter.com/useoptic)
