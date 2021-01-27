---
date: "7/15/2020"
title: "Optic 8.2"
author: Aidan Cunniffe
author_url: "https://github.com/acunniffe"
author_image_url: "/img/team/aidan.jpg"
category: Release
---

Today we're launching Optic 8.2.0 — a big push to make Optic much more usable.

## Major Improvements
The Diff UX has been completely redesigned to make creating and updating your specification much easier.
(Under the hood) Performance has been 100x faster evaluating large captures (1000s of API Requests)
(Under the hood) snapshot tests now verify the diffing logic at the core of Optic, catch regressions, and help us develop more confidently. Our new process for fixing diff bugs requires us to add more use cases to these test suites so that all fixes are backed up by tests going forward

<!--truncate-->

## New Diff Page Design
The first thing you'll notice is that we've separated 'Endpoint Diffs' from 'Undocumented URLs'.

![alt](/img/blog-content/82-1.png)

On the Endpoint Diffs page you'll see all your documented endpoints, including those that are working as designed in the current capture. Now, at a glance, you can get a sense of your API's surface area and which parts are changing/stable.

![alt](/img/blog-content/82-2.png)

On the Undocumented URLs page, you can see known paths that are "Ready to Document" and a weighted sampling of the unrecognized URLs in your API. We used a few methods to weight/sort them so it's more navigable than a giant alphabetized list.


## Documenting your API the First Time
Documenting your initial API specification is the first task for most new users. In large 50+ endpoint APIs, documenting everything with Optic could take the better part of an afternoon. The performance improvements in 8.2.0, and the improvements to "Infer Polymorphism" feature will cut down that timeline dramatically.

Choosing the "Infer Polymorphism" option will save you a lot of time building your initial specification. Instead of just looking at one request to build your documentation, Optic will look at many and determine which fields are Optional, Nullable or OneOfs for you. With all the bug fixes + performance improvements "Infer Polymorphism" is now usable enough that we recommend using it when building your initial spec!

We hope all these boosts make it really easy to quickly see benefits from using Optic. If you need help getting started you can always [setup an on-boarding session with one of the maintainers](/docs/community).

![alt](/img/blog-content/82-3.png)

![alt](/img/blog-content/82-4.png)

## What's Next
Thanks all! Most of our time has been filled making these essential improvements to the core and building our team. The latest new feature, production Optic Agents, has been tested with users the last few weeks. The early adopters have been really helpful as we work out the kinks and improve the workflows. We're excited to release this work publicly and show everyone what we've been up to soon!

Want to try the latest? [Download 8.2.0 today!](https://docs.useoptic.com/install)

As always, if you have cool ideas for Optic, questions about how to use the tool, or just want to chill and talk open source — you can schedule a [Meet the Mainers Zoom call anytime](/docs/community).
