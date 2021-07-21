---
date: 2021-07-21
title: "The Future of API Specifications"
author: Aidan Cunniffe
author_url: "https://twitter.com/aidandcunniffe"
image: "https://imgur.com/GcMFCRl"
author_image_url: "/img/team/aidan.jpg"
---
I'm a big believer that the order you read a set of books can matter more than the books you read. When different ideas and perspectives mix into a savory synapse soup -- good things happen. That was my last 10 days. I've gotten to talk to some amazing people about the history of Swagger/OpenAPI (history matters), why API Specifications matter, and the problems we face building and scaling tools across the wider API Community.

My brain was overloading, so I sat down and did a talk:

### Watch the Talk
<iframe width="100%" height="400" src="https://www.youtube.com/embed/ozbb5ciauQ4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


Big thank you to [Matt Trask](https://twitter.com/matthewtrask), [Dev Doshi](https://twitter.com/thedevisadev), [Mike Amundson](https://twitter.com/mamund) and [Kin Lane](https://twitter.com/kinlane) for the amazing discussions and storytelling. Lucky for everyone reading this, all our conversations are recorded so anyone reading this can try the synapse soup and share their ideas too 🍲.

---

### Key Idea: Make API specs like APIs

- We value **evolvability, approachability, and usability** in our APIs, but those principles have not made it into the API specifications themselves.
- **API Specifications are the API for our APIs**. Shouldn’t we treat them that way? What would we change if we designed new API specifications like we designed APIs?
- The current architecture for API specifications complicates the use cases people care most about: **design**, **goverence**, **changelogs**, **validation**, and the emerging patterns/protocols (**hypermedia, graphql, grpc...**)

![alt](/img/apispecs.007.jpeg)

- Explores the conflict and consequences of optimizing for all the above: **Human Writable**, **Human Readable**, **Machine Readbale** and **Human Writable**

![alt](/img/apispecs.012.jpeg)

- Proposes a new framing for the problem: **make API specs like APIs**
  what if instead of giant YAML files, specs were
  more like APIs?

  …there are different queries, optimized for each use case

  …and mutations you call when the API changes

  vendors use the API too! with the same reference implementation

![alt](/img/apispecs.015.jpeg)

- [**Live Demo from the video. The benefits**](https://opticdev.github.io/changelog-spec-demo/)
  - one reference implementation, shared by every vendor
  - API specs don't 'break' anymore when we make them better
  - (because of the evolability above) you could add new protocols and spec features at-will, and forwards-proof many of the hard choices


- **Ends with a quick reminder** -- we know how to build systems like this, it's what we do with our APIs every day. We are more than capable of making this happen :)

### Get Involved
🌊  Want to help bring about this, or another future for API specs? Share the post
✨  Want to explore these ideas together? [Join the conversation on GitHub](https://github.com/opticdev/optic/discussions/1032)

👋  My [DMs are Open on Twitter](https://twitter.com/aidandcunniffe)

Hope this was fun for everyone, keep thinking, get chatting. Cheers.

#### Source Material

- [Kin asked an Amazing Question on Twitter](https://twitter.com/kinlane/status/1414690872222834688?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1414742928182833156%7Ctwgr%5E%7Ctwcon%5Es2_&ref_url=https%3A%2F%2Fpublish.twitter.com%2F%3Fquery%3Dhttps3A2F2Ftwitter.com2Faidandcunniffe2Fstatus2F1414742928182833156widget%3DTweet) "What is
  @OpenApiSpec"?
  - [Josh Ponelat](https://twitter.com/jponelat) had [a great answer](https://twitter.com/jponelat/status/1415617941622640643)
  - I threw my hat in the ring too [with this response](https://twitter.com/aidandcunniffe/status/1414742928182833156)

- [API Storytelling with Matt Trask](https://www.youtube.com/watch?v=gaFZAZjHFjQ)
- [API Storytelling with Dev Doshi](https://www.youtube.com/watch?v=pUkQ0aei0KI)
- [Slides from this talk](https://www.slideshare.net/AidanCunniffe/the-future-of-api-specifications-aidan-cunniffe-2021)

---

