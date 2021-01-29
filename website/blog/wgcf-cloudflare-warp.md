---
date: "8/16/2020"
title: "How wgcf used Optic to bring Cloudflare Warp to every Platform"
author: Aidan Cunniffe
author_url: "https://github.com/acunniffe"
author_image_url: "/img/team/aidan.jpg"
category: Built with Optic
---

*The following post is a conversation with [Victor](https://github.com/ViRb3), the author and maintainer of [`wgcf`](https://github.com/ViRb3/wgcf)*

<!--truncate-->

![alt](/img/blog-content/wgcf.png)

**What is Cloudflare Warp?:**
A speed and privacy conscious VPN from [Cloudflare](https://1.1.1.1/), built on the Wireguard protocol.

**What is `wgcf`?**:
Today Cloudflare Warp only officially supports iOS and Android. `wgcf` is an unofficial, cross-platform CLI for using Cloudflare Warp. It allows you to use the service from any platform, even those that are not officially supported (*i.e.* macOS, Windows, and Linux). `wgcf` uses Warp's API to register users, manage their subscriptions, and create WireGuard profiles for their machines.

`wgcf` has been installed by nearly 30k users.

### How `wgcf` uses Optic

**Aidan:**
Last week you added Optic, what problem is it solving for you project?

**Victor:**
Being an unofficial project, I didn't have the luxury of an official API specification or library to interact with the service. In the beginning I wrote all API client code manually, and that was a very time-consuming and error-prone process, especially when it came to knowing when their API changed, and how to update my code. Additionally, while my use-case was small and this manual approach worked, I knew that it would scale very badly, so I was always on the lookout for a better alternative.

Meet Optic - a project that completely removed my need to write any API spec or client code. With Optic, I only have to maintain a neat and simple "API test file". This file's code has one simple purpose: to send a proper request to each endpoint that I need to use in my tool. Optic learns how the Warp API works from the traffic, detects API changes, and gives me an easy way to understand their API and document it.

![alt](/img/blog-content/optic-ui-wgcf.png)

Then, with one command, Optic outputs a full OpenAPI 3 specification. With one more command, a separate [code generation tool](https://github.com/openapitools/openapi-generator) would convert this file into fully-functional API client code, in any programming language that I request. I created a simple post-processor for the OpenAPI file to override certain fields and further customize the generated code. This makes it human-friendly, consistent, and ready to use without any manual changes.

![alt](/img/blog-content/wgcf-generate.png)

---

**Summary and Links to Code:**

- Optic learns the behavior of the Cloudflare Warp API so that it can be used by `wgcf`.
- Optic maintains an [unofficial OpenAPI spec](https://github.com/ViRb3/wgcf/blob/master/openapi-spec.json) for the Warp API endpoints used by `wgcf`. Victor does not have to worry about maintaining the 1200 lines of OpenAPI -- Optic keeps this up-to-date for him.
- This OpenAPI spec is used to [generate the Go Client](https://github.com/ViRb3/wgcf/tree/master/openapi) the project used to interact with Warp's API.
- Optic contract tests the Warp API, detecting any changes in behavior whenever Victor runs the [`api_tests`](https://github.com/ViRb3/wgcf/blob/master/api_tests/main.go).

![alt](/img/blog-content/optic-ci-detect.png)

---

**Aidan:**
What was your favorite part of using Optic?

**Victor:**
My favorite part of using Optic was how simple it was, and how easy it was to automate it using scripts. It took only one day and a single script to migrate my project to completely automated API client code generation. It was nice to get the benefits of OpenAPI tooling without the cost of writing and maintaining the spec myself.

**Aidan:**
Nice! Must be nice not to have to maintain the API client yourself anymore! What were the rough edges? What do you hope to see next from the project?

**Victor:**
While the general stability was on-point, I often had to refresh the endpoint page to see my changes after I documented an endpoint. Also, while in my case the API was documented nicely by Optic out of the box, I would love to see the possibility to manually define/edit the specifications, especially when it comes to property types (string, int) and conflicts/multiple different responses from the same endpoint.

**Aidan:**
Makes sense! Allowing users/teams to manually change the API spec is going to be a focus of ours over the next few months. Our plan is to let you design-by-example, not design-by-spec. The natural way to design an API is with a lot of real examples for how things should work. With Optic, you can imagine setting the type of a field by providing examples of all the possible things that field could be and letting Optic suggest a change (similar to how the diff works today). I'll make sure we get your input when those features start getting designed.

Thanks for building `wgcf`, contributing so much to the Open Source community, and taking the time to chat!

---

## [Try `wgcf` today!](https://github.com/ViRb3/wgcf)

Sound cool? Interested in trying Optic with your own project? [Learn more about Optic today](https://useoptic.com)!

