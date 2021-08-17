---
date: 2021-08-12
title: "An API Strategy that Works for Everyone"
author: Stephen Mizell
author_url: "https://github.com/smizell"
author_image_url: "/img/team/smizell.jpg"
description: ""
# image: "/img/blog-content/flowchart.png"
category: Community
---

When I've talked to companies about the way they design and build APIs and ask if they're using a Design First or Code First approach, many will emphatically respond they're Design First—they've decided that every team must update their OpenAPI document before they write a line of code. But when I ask if they have any teams that haven't made the switch and still follow a Code First approach, the truth comes out. "Well, actually, all our teams are Code First at the moment, but we're all moving to Design First."

Our industry pushes people toward Design First for many good reasons. The approach promises better designs, fewer breaking changes, and increased involvement from people outside the development team. Who wouldn't want those benefits?

But after choosing to move to Design First, these companies soon find out the path forward is difficult. Adoption is challenging. They have to ask the Code First teams to give up their current tools and practices. They have to require the teams to adopt a new governance model that might require months to get to conformance. And they have to ask people to make changes for the greater good of the company. It's a lot to ask.

## How we change APIs: propose, build, test, ship, observe, and prove

When we're considering Design First over Code First, what we're really wanting is a process that allows teams to design and build quality APIs at scale. We want them to be empowered to continuously deliver APIs that are consistent, product-focused, and user-focused. We want a workflow that pushes us toward meaningful discussions up front, involves the right people in that discussion, and ensures that the development teams correctly build the agreed-upon API design.

Design First and Code First practices capture but a small part of these desired benefits, though. And most workflows that revolve around these two paradigms fall well short of providing a complete solution to the problems. We need more help.

Consider a workflow that uses OpenAPI as the source of truth. Teams propose changes by making a new version of the OpenAPI document and including their changes in the new version. But at that point, it's up to the developers, QA engineers, and operations team to eyeball the changes, figure out what to build, and make sure it's working as designed. And then they have to find ways to observe and prove they built it according to the plan.

The engineering team has to act like detectives, scouring logs for issues, writing tests they hope cover all the cracks and crevices, and questioning witnesses to see if they saw anything strange while using the API. It's a lot of hard work.

## Proposals and evidence: important pieces of defining an API strategy every team can adopt

Without the right tools, Design First alone puts the burden on the engineering teams to manage API changes, usually manually. These teams lack tools they need to propose changes, gather evidence as they observe their APIs, and use that evidence to prove their API works as designed without the fear of missing important details or adding hours of additional sleuthing work.

We have a solution for this at Optic.

* First, we have the idea of a **proposal**. It's something a team can do before they write a line of code—such as in Design First—or it's something a team could automatically create after they've written code and gathered evidence—as in Code First. It lifts the burden off teams trying to move to Design First, and it helps teams practicing Code First to be successful using the processes they're use to. It makes the distinction between Design First and Code First dissolve away. And it gets people talking about the design upfront—one of the main benefits we're looking for in our processes.
* Second, we have the idea of **evidence**, an idea that's complimentary to a **proposal**. Optic can work alongside a developer to help them know they've correctly developed the proposed change and show proof of their work to their team members. Optic can sit in a team's CI/CD pipeline and gather new evidence while taking into account old evidence, all to make sure the full design is there. And Optic can observe staging and production environments to gather evidence that everything is running smoothly as designed.

We make this workflow possible by treating change as first-class in the API development lifecycle. A proposal is a granular change and evidence is gathered and compared to these granular changes. This is what we call a forward-only approach. Any team can start writing proposals and gathering evidence without leaving their tools and processes behind, without getting a thousand governance issues on their existing APIs, and without moving to a new paradigm like Design First. Teams can adopt a new workflow without giving up all they know.

## Rethinking the API specification

In modern API development lifecycles, the API specification—the OpenAPI document in most cases—is the source of truth. But what happens to the API specification in this Optic workflow? It would seem that these ideas around proposals and evidence would mean OpenAPI is no longer be necessary. We'd argue the opposite at Optic, that not only is it necessary and useful, but with this workflow, it's more relevant, robust, and correct.

First, since Optic can gather evidence in specific environments, Optic can show you exactly what features and proposals have been deployed. This means you can ask questions about the API specification, like what's the specification for staging? What about production? What's the future specification for our approved proposals? Even a question like, what is the API specification for this specific vendor? These questions can't be answered with a single OpenAPI document.

Second, you can see your changes to your API specification inline with the latest version. Optic shows which endpoints are new and which ones are changing by showing you diffs of the collected evidence. This lets you see details about the API changes within the context of your existing API specification.

Third, Optic keeps the collected evidence and the history of when something changed in your API. This means Optic can show you how your specification is changing over time. This acts as an audit log to know when you proposed a change, when it was implemented and in what Pull Request, and when it showed up in production. This helps your team and informs your consumers.

## How to get going with this Optic approach

Getting started with this workflow is the fun part. To use Optic, you can leave your teams where they are. Keep your tools and processes. Keep your existing API strategy. And keep helping people understand what it means to use HTTP and JSON wisely and correctly. Then put Optic in the hands of developers, put it into your build pipeline, and put it into your live environments. Let the proposals and evidence gathering change your workflows for you.

We believe these ideas and this workflow are the missing pieces to helping people adopt an API development lifecycle that produces quality APIs across an array of teams. Design First? Sure. Code First? You can do that, too. You can even use them both together. No matter the approach, you'll get the full workflow you've been searching for—the one that helps you design and build quality APIs that are focused are your product and your users.
