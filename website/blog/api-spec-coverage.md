---
date: "10/6/2020"
title: "Let’s Talk about API Coverage"
author: Aidan Cunniffe
author_url: "https://github.com/acunniffe"
author_image_url: "/img/team/aidan.jpg"
category: Release
---

Today I’m really excited to show off a new ‘primitive’ for API tooling that Optic has been working on. Everyone, meet **spec coverage.**

API spec coverage measures how much of your API spec was covered by traffic, and like everything else we do, it’s [open source](https://github.com/opticdev/optic)!

The Optic CLI now produces a coverage report for any of your test scripts, Postman collections, or even a bunch of manual CURLs to a server.

<!--truncate-->

Just run any task with the `--collect-coverage` flag, and like magic, when the task ends a coverage report is generated:

 `api run tests --collect-coverage`

 ![alt](/img/blog-content/coverage-screen-shot.jpeg)

Code coverage reports on lines/files where code was executed, spec coverage reports on the endpoints, body types, and status codes that were covered by traffic.

## Coverage Gives Tests Power

Coverage helps developers understand what they're testing, giving them more confidence that passing tests mean working software. Code coverage is relied on by most software engineering teams to give their tests power. Passing tests, paired with high code coverage, is a strong and trusted signal that your code is working as designed.

Code coverage measures which files, lines and branches are executed by your tests.

API spec coverage measures which endpoints, content types, status codes, and shapes are used in your test traffic.

## Coverage + Validation Proxies

Validation proxies like [Stoplight’s Prism](https://github.com/stoplightio/prism) and [Optic](https://github.com/opticdev/optic) monitor traffic and log diffs whenever the traffic moving through the proxy violates the API specification. A lot of API teams like to run test traffic through validation proxies because the proxies enforce exhaustive assertions about each schema, that are no fun to write or maintain by hand.

Validation proxies count all the instances when the traffic did not match the spec, but the limitation of today's validation proxies is that they don’t have much *power.

Imagine starting a proxy, sending one valid request, then stopping the proxy. No Diff! Does this mean the API is working as designed? Absolutely not. A lack of diff doesn't tell you very much. That scenario is equivalent to running a single code test and proclaiming “well everything must work, that one test passed”. Coverage was invented to solve this problem. Coverage gives tests power.

Validation Proxies + Coverage Reports give you an easy way to understand if your API is working as designed without requiring you to write and maintain an expansive bank of automated tests.

Coverage and Validation are symbiotic, two rails, that keep the train steady and on course. Together, each brings far more signal than either does alone.

## Spec Coverage From Everywhere

Code Coverage is a build-time metric, but for APIs, runtime is the funtime. It’s advantageous to have a spec coverage report that can be updated as more traffic is monitored. Relevant test traffic can come from a lot of places. It might be emitted by code tests, the product of a developer manually using the API/application, the output of a [Postman](https://github.com/postmanlabs/newman) collection, live traffic from staging environments, or even traffic from QA’s pass on the latest code.

Optic’s coverage reports are merge-able, making it easy to understand which tests and business processes are responsible for providing you confidence in each API. Optic users have self-reported that they expect these reports to have an immediate impact on their testing practices; helping them discover opportunities to deduplicate tests and improve quality by making API Coverage an important metric on their teams. We’ll circle back in coming months with case studies from teams who have adopted coverage.

### Hey Coverage, Welcome to the Club

I hope everyone enjoys giving coverage a try. We’re looking forward to listening to your feedback and hearing stories about how you use the insights coverage provides.

If you want to contribute or pitch us ideas, feel free to [setup a meet the maintainers call](https://calendly.com/opticlabs/maintainer-office-hours).

It isn’t always straightforward to connect API tests to a validation proxy, sometimes the frameworks route traffic internally and it never hits the network bridge making it hard to use something like Optic. If you’re new to this, [setup a call with Lou and he’ll help you get setup](https://calendly.com/opticlabs/aidan-and-lou-the-optic-crew). We’ll also share back the docs for how to get your framework wired up w/ the community so everyone benefits 😇.
