---
date: 2021-07-01
title: "Four Approaches for Documenting APIs"
author: Deborah Ruck
author_url: "https://deborahruck.com/"
author_image_url: "/img/people/deborah-ruck.jpeg"
category: Community
---

According to Gallup, my top strength is [Learner](https://www.gallup.com/cliftonstrengths/en/252293/learner-theme.aspx). That’s probably the reason I got into software development over two decades ago. Technology changes so quickly, there’s always something new to learn.

Java was the first real programming language I used back then. At the time, it had been around for about three years and was still very immature. But all this time, there’s something that I have always remembered and appreciated about Java: its exceptional API documentation. It was easy to understand, the examples were useful, and it was usually all I needed to solve any problem.

Good API documentation shouldn’t be exceptional, but it is. And it’s important.

<!--truncate -->

Your API documentation shows consumers how best to use your API. Documentation that’s not helpful or easy to understand (or worse yet, no documentation at all) will hinder the adoption of your API, no matter how good it is.

But creating API documentation and keeping it up to date can be a challenge. In many cases,  the only documentation available consists of ad hoc comments left by the developer who last touched the code.

In this post, we’ll compare four approaches you can use to create and maintain your API documentation:
1. Manually updating API docs
1. Designing API docs then building to it
1. Programmatically generating API docs with Express OpenAPI
1. Using Optic to automatically diff and update your API docs

## Method 1: Manual

You can create and update API documentation manually in several ways. One way is to create inline code comments or annotations, as is done in PHP and Java, respectively. Alternatively, developers can create standalone files using text documentation languages such as Markdown.

### How It Works

Markdown is a highly supported text format documentation language that allows for hyperlinks and other HTML-type formatting while retaining a plain text format. It can be stored alongside code files in repositories and used with tools such as [Slate](https://docs.slatejs.org/) and [Apiary](https://apiary.io/) to create static websites the entire team can use to access API documentation. Many popular code editors such as VSCode and GitLab support Markdown files.

### Pros

**Full control:** Updating docs manually is an easy-to-use approach that gives you full control over your documentation. Documentation is presented in a simple format that is easier to understand than generated API documentation.

**No tooling required:** Developers can add code comments or annotations as they work without having to switch to separate tools.

### Cons

**Time-consuming:** Manually writing documentation can be time-consuming, especially if your API is on the larger side. The prospect of creating and maintaining large volumes of API documentation can be daunting for developers.

**Annoying:** Most developers don’t enjoy creating documentation. Because developers are more eager to get on with coding, inline documentation is likely to be sparse and filled with technical jargon that might not be helpful to the average API consumer.

**Hard to keep accurate:** Keeping documents in sync with code is also a major challenge using this process. Developers don’t want to spend time constantly updating API documentation. Eventually, the documentation and the code will fall out of sync and become frustrating for anyone attempting to use it.

**Prone to errors:** Developers may change API contracts, causing them to break on the consumer end, create security issues, or create a roadblock for other team members.

## Method 2: Design First

Designing and writing your API definition before writing any code, and then building to that design, is referred to as the Design First approach.

### How It Works

With the Design First approach, the specifics of your API—including endpoints, requests, response objects, error codes, and headers—are fleshed out in detail and tested before being handed over to developers for implementation.

After the design is complete, you can share API documents with other technical and non-technical stakeholders for review and feedback. This gives you the opportunity to catch issues before development begins. Once the design is approved, developers can use it to write or generate code implementations using tools such as [Swagger Editor](http://editor.swagger.io/).

When you design first, you can ensure that your API definitions conform to industry standards and best practices.

### Pros

**Other consumers can work without implementation:** API consumers don’t have to wait until coding is complete to use the API. After the design is complete, API developers, consumers, and technical writers can use the API in parallel from the documentation rather than wait for each stage to complete.

**Promotes communication and collaboration:** Miscommunication between team members can lead to incorrect API implementation. Designing your API first encourages a culture of feedback and confirms that everyone has the same vision for the API.

### Cons

**Hard to keep updated:** Design is an ongoing process; new changes should be made to the design first. However, if a hotfix or new requirement is urgent, the design process could be skipped, causing the documentation and code implementation to become out of sync.

**Chasing errors after implementation:** Changes on the design end can break implementations on the client side, causing developers to stop working on new features or other updates while finding and fixing the issue.

## Method 3: Code First

Code First, the traditional approach to API documentation, is a bottom-up approach that involves programmatically generating API docs from existing code.

### How It Works

With the Code First approach, developers code the API directly from completed business requirements, leaving the creation of the documentation until later in the project. You can create documentation using the previously mentioned manual method or by generating machine-readable API definitions with [OpenAPI](https://www.openapis.org/) and frameworks such as [`express-openapi`](https://www.npmjs.com/package/express-openapi).

OpenAPI is an API description format for REST APIs that has become an industry standard for documenting APIs. With `express-openapi`, you can generate and validate OpenAPI documentation in JSON for Express apps. `express-openapi` can auto-generate documentation using the code definitions in your app or from the request and response schemas and parameters of your API spec.

### Pros

**More accurate:** Because your API is generated from existing code, the definition will always remain consistent with the API implementation. Consumers can be confident that the documentation is an accurate reflection of the code and that the API will work as expected.

**Faster delivery:** If your projects are small or need to be fast to market, the Code First approach might be a better option for you. Developers can get to work immediately, coding directly from requirements documents instead of after the design process, leaving documentation generation until the end of the project.

### Cons

**Changes are hard to see:** Since changes occur in the code first and are then reflected in the generated API documents, there’s no way to compare previous versions of the API with the current version to validate those changes.

**Must call each endpoint to generate docs:** To generate docs, you still need to fill in the URI; method; parameters, if any; headers; and authentication details for the API.

## Method 4: Documentation Diffs with Optic

[Optic](https://useoptic.com/) is a version control system and central repository for API contracts that function much like GitHub. It helps you document your APIs as you build them by observing request and response traffic to learn the behavior of your API. It presents the API changes it finds as diffs that can be reviewed, approved, or documented before your API is released.

### How It Works

Using Optic, you can publish your API documentation to a shared website, making it accessible by your entire team. The team can then search documentation, ask questions, see changelogs, and receive change notifications for specific APIs. Optic can manage your documentation process regardless of whether you are using a local or cloud environment.

![Optic supports design-first and code-first workflows](/img/blog-content/optic-supports-design-first-and-code-first-workflows.png)

### Pros

**Accurate:** Because Optic observes changes to your API in real time, and learns from your API contract’s behavior, it’s always in sync with your code. Once you approve changes, Optic updates the specification for the affected APIs.

**Shows you diffs:** Optic diffs give you the opportunity to compare differences in the local development environment to the API specification. Being able to see differences side by side means that you can isolate potential problems early, ensuring that your API remains robust.

**Can be used during code review:** Optic provides both API changes and changelogs that can provide valuable information and feedback when reviewing code.

**Works with all major languages and frameworks:** Integrates with [major languages and API frameworks](/docs/integrations/integrations), including Django, Express.js, C-Sharp, and Laravel, IDEs such as IntelliJ and VSCode, and CI/CD environments like GitHub Actions and CircleCI.

### Cons

**Must call each endpoint to generate docs:** Optic detects and shows new URLs as diffs with suggestions for adding them to the API specification. The onus, however, is still on the developer to manually add the URI, method, parameters, and so forth for the new endpoint. The possibility still exists that documentation for new endpoints could fall through the cracks.

## Conclusion

Keeping your API documentation up to date is important. But it’s neither an appealing nor an effortless task. There’s a constant battle to keep API specifications, documentation, and code implementations in sync.

With Optic, you can write OpenAPI specifications in minutes and know that they will remain accurate. Optic is a robust solution that makes it easy for developers to create and maintain API documentation and ensure that users have what they need to consume it.

Start documenting your API today with [Optic](https://useoptic.com/)—[contact them](https://useoptic.com/docs/community) if you need help integrating with your existing documentation tools.
