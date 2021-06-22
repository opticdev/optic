---
date: "6/16/2021"
title: "The Missing Pieces of Design First Workflows"
author: Stephen Mizell
author_url: "https://github.com/smizell"
author_image_url: "/img/team/smizell.jpg"
description: |
    To do a Design First approach well, we need to incorporate other practices and patterns into our workflow. We need to be able to experimentation, visibility, collaboration, quality, and evidence in our workflows.
image: "/img/blog-content/flowchart.png"
category: Community
---

![Flowchart example](/img/blog-content/flowchart.png)

Design First is a practice that encourages us to design any API change before writing the code code. The goal is to do the upfront work to produce better API changes. Design First is normally done by modifying an OpenAPI document first and then using that change as guidance on what to develop.

But Design First is a small piece to the larger API development process. There are more practices and patterns we need in order to make design a cornerstone to building good APIs.

When taken alone, Design First seems to imply that the process is linear—first there's the design, then development, then deployment. But design doesn't work this way. Design is something we're always doing, even when writing code.

What then are the practices we need to add into our Design First workflows that makes Design First work?

<!--truncate-->

## Experimenting: is it cheap to try out ideas?

Good design requires shifting our mindset about how we design. API design is concerned with researching the needs, coming up with a hypothesis, and designing a solution we think will meet the requirements. This design process is always looping back onto itself like this. We let our ideas influence our experimenting, and we let our experimenting influence our ideas.

Design First works when we include experimenting and prototyping into the way we work. To this, we have to start by fostering a culture that values experimenting. People need the freedom and safety to try things out and learn from mistakes rather than assume perfection from the start.

We also need tools that make experimenting cheap and possible. Similar to how sketching ideas on paper gives us a free space to think, we need tools that help us sketch out an idea for an API change and see how it works. We should be able to brainstorm an idea, try it out, throw it to the side, then pick it up later after we learned we may have been onto something.

Most tools and practices today push a rigid, linear approach to design, making it harder to play and explore before proposing a change to the team. Users have to work around these limitations to experiment.

## Visibility: what parts of the API does a change affect?

When we make a change to an API schema, we need to know what endpoints the change affected. Was it one endpoint? Was it 20? Did it affect other APIs that reuse this schema? How do we find this out?

Imagine we have a resource that supports `GET` and `PUT` for the same schema. This allows us to retrieve the resource, make a change, and update it on the server with `PUT`.

Adding a required field to the schema may seem like a non-breaking change if we only look at the `GET` operation. But because of the `PUT` it would be a breaking change—existing client code wouldn't know about the new required field and would fail making calls that once succeeded. Without visibility like this, we're left to figure this out manually.

Visibility is more than knowing there was a change. It's about understanding how the change affects the API as a whole. And it's about helping people make good design choices by having those insights early in the API development process.

Many tools today aren't able to highlight the parts of the specification that have changed like this. It's up to the user to figure it manually.

## Collaboration: can we propose a change and talk about it?

Collaboration balances our experimentation. We can't tinker forever, and we can't do design in a vacuum. We eventually need to finalize our idea and formalize it into a proposal we can share with our team.

Once we've proposed a change, we should include the right people into the conversation. We need product managers to help guide the vision of the API. We need domain experts to validate our ideas and API behavior. And we need developers who can share insights about any systems limitations that might prevent them from implementing a desired change.

If we design and build things in isolation and wait to have discussions, we risk leaving people out and missing important insights they may have shared. The right tools can help us propose changes and start a discussion early on.

Workflows today focus collaboration around a specific version of the specification rather than around the proposed changes. At best, users may see the lines in the new specification version that have changed. This shifts the conversation away from the specifics of a change.

## Quality: are we building APIs like the other teams?

When building APIs across larger organizations, teams need guidance and insights on building a quality API. Does the API use the right patterns and practices? Is it consistent with APIs other teams are building? Is it evolving the way other APIs are evolving?

When teams don't follow the company's API guidelines, quality goes down. When teams get quick and automatic feedback throughout the design and development process, quality improves. Early guidance creates a quicker feedback loop leading to informed decisions.

Design isn't restricted to the beginning of the API development process, and quality isn't something restricted to the end of it. To do design well, we need to do quality well, and vice versa.

Popular workflows focus the quality on the correctness of the entire OpenAPI document rather than on the specifics of a change. This creates a lot of noise, and over time people stop looking at the warnings. It would help to give focused feedback about the quality of the change itself, not the specification as a whole.

## Evidence: did we build the change correctly?

A Design First approach requires verifying we built the thing we designed. The design might be good, it may go through a fruitful discussion before getting to development, and it may meet all the quality requirements for APIs. But if we can't determine whether or not our code aligns with our design, we risk deploying the wrong thing and publishing an API reference that doesn't match the deployed API.

Without an evidence-based workflow, we're crossing our fingers and hoping everything matches up, or we're hoping someone catches any unforeseen missteps when in review.

For us to gather evidence, we need to look at the behavior of our API while it's running and see if it matches up with the API specification. This is ensuring the quality of our design makes it through to the implementation and gets into the hands of the API consumers.

It's common for workflows to encourage hand-written tests to show evidence. Without a tool that can compare traffic with the proposed API specification, it's up to the person writing the tests to codify the API changes by hand.

## Relationships: do we have open communication with consumers?

Design First doesn't work if we never talk to the people who use the API. The goal of Design First is to gather people together who are interested in the value of the API. This includes the API consumers.

Are people able to share the struggles encountered while using the API? Can consumers provide outside feedback on ways to improve the API? Does the team share upcoming changes with consumers so they can better prepare themselves rather than learn in production?

API consumers have to be and informed part of the team. They need open channels that encourage discussion. They need insights into changes before they happen. This requires cultivating relationships between the API team and the consumers.

Unfortunately, the API consumer is left out of workflows today. The burden is on them to keep up with API changes, and many times they find out about change when it's too late.

## Putting these ideas to practice

If you're trying to garner adoption in your company around a Design First process, consider these other areas that are an important part of the approach. It's easy to pick Design First as a practice without considering the full experience around how people build APIs.

You can find ways to help people get more visibility into their API changes, collaborate around the changes, and ensure each change meets the quality standards of the company—all without requiring teams to abandon their existing workflows. You can help teams transition to a better way to build APIs in their own context.

In a future post, we'll look at the ways Optic tries to help in all these areas to encourage a collaborative design and development experience for the entire team.