---
date: "8/6/2020"
title: "Speeding towards Optic 9"
author: Aidan Cunniffe
author_url: "https://github.com/acunniffe"
author_image_url: "/img/team/aidan.jpg"
category: Engineering
---

With the [release of Optic 8.2 a few weeks ago](/blog/release-8.2), major improvements were made to both performance, and the reliability of the diff. Version 8.2 is noticeably faster, but the performance still breaks down when a large number of endpoints have been documented or when diffing large JSON Bodies (multiple MBs). We had hoped the improvements in 8.2 would cary us through the end of the year, but some large teams trying to adopt Optic are still blocked by poor performance -- often having to wait several seconds between critical actions.

<!--truncate-->

### Fixing Performance for Good
We had our pitching/betting meeting on Friday -- that's when the team of maintainers come together and advocate our positions for what we think should be built next. The consensus was definitive: the Diff Engine needed a major rethink, followed by a major rewrite.

**Why is the diff slow today?** The core domain logic of Optic was written in Scala and is run in a Node runtime via Scala JS. Why? No real reason -- we were iterating fast all 2019 and one of our experiments could launch faster by using code we had in Scala. We learned a lot with the Scala diff engine, but now that we actually know what we're building, we would not make the same choice a second time.

The diff compute itself is iterating over hordes of API logs meaning, when running in Node, we're paying a heavy cost for the Garbage Collection. On top of that, since Node is single-threaded, we can't take advantage of any parallelism.

We ran some experiments to see how much faster the Diff can run on the JVM vs Node and were pretty surprised by the scale of the delta:

![pa](/img/blog-content/parallel.png)

Unfortunately, bundling and distributing JVMs is daunting task. Especially since we need Optic to run on developer machines and in all the live environments teams want to run Optic. So ...drumroll... we're reimplementing the Diff Engine in Rust.

### Why the Rewrite?

Optic is most needed on teams with many APIs and we can point to real users where performance is the only thing blocking their adoption. That's bad for the product, the community and our company. Rust offers us the opportunity for huge improvements in performance and massive portability.

The Diff Engine is the last part of Optic that is still the "one-to-throw-away" -- our UI and CLI have been rewritten several times, but the original diff engine has never been rewritten to support mass adoption and contribution.

Since we have snapshot tests covering all the Diff Use Cases (why the bug rate went way down last release) we feel pretty good about our ability to safely port the logic and catch any regressions. Rewrites are always risky, but the benefits here are clear, and the snapshot tests help us minimize those risks.

![tests](/img/blog-content/domain-tests.png)

**Timeline**: We have a plan to get to an internal preview of this in 6 weeks, and hope to have it publicly available not long after that. You know how these platforms can expand in scope -- so we are planning to release updates on our blog to keep users well-appraised of where the work stands.

We'll keep sharing Engineering updates on the blog so the community can follow our progress.

Got ideas? Know some Rust performance gotchas? Want to help? [Setup a Meet the Mainers Zoom Call](/docs/community).
