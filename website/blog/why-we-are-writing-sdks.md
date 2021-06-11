---
date: "06/11/2021"
title: "Why We Are Writing SDKs"
author: Mike Elsmore
author_url: "https://github.com/ukmadlz"
author_image_url: "/img/team/mike-elsmore.png"
category: Community
---

I’m new around here, and my first post is about something I really love… code that makes life easier!

To begin with Optic's CLI is ridiculously easy to start using within your application, you simply head to the root of your directory and run `api init`, configure your `.optic.yaml` to wrap your application start command, and tada you’ve started gathering data about your API endpoints by just using them. Super simple and great right? To look at the full process and implement it yourself, please check out [our documentation](https://www.useoptic.com/docs/).

But what happens when you can’t do that? Plenty of instances exist where it’s very complex to work in a team and wrap the command that starts your application. What happens when you use feature flags on that command, or you have to make operating system specific changes, or your API testing is done entirely internally and doesn't hit the network?

<!-- truncate -->

## Introducing Optic SDKs
Firstly, the idea behind these isn’t to be able to interact with Optic's Cloud, or with the learning process of the CLI tool, it’s to simplify capturing the API traffic and sending the captures to the CLI. So when looking at it you won’t see handy API classes etc to interact with.

With that out of the way, let’s take a look at what we have so far, it’s all very work in progress so please pass along your feedback so we can make it just what you want/need sooner rather than later.

Firstly we put together a specification of what should be contained in the SDK, we’ve published this on [Notion](https://www.notion.so/useoptic/Optic-SDK-Specification-ff4d7ba6f0444c9eb0862a6d5748d707) for now, please give it a look and add your comments.
What this specification tries to achieve is a language agnostic flow of what the SDK could do, from giving a point of configuration, through to what it captures, the format it sends in, and where it sends the captured data. 

Currently we have a work in progress Node SDK on GitHub (but not published to NPM) at [https://github.com/opticdev/optic-node/tree/main/sdk](https://github.com/opticdev/optic-node/tree/main/sdk), and this example just shows a working implementation of our SDK specification.
## But this isn’t simpler than before?
Yes reader, you’d be correct about that. It does allow for the more in code configuration of your captures and it does allow for a means to capture your API traffic within your application but it’s not plug and play. But this is step one in our master plan here at Optic to take over the world by being super simple, but that means  little more upfront work.
Once we have these SDKs it allows for middleware to be produced simply and quickly, as all the hard work has been done up front in the SDK! If you are unaware of what middleware is, here is a one liner:

> Middleware is a type of computer software that provides services to software applications beyond those available from the operating system. It can be described as "software glue".
> https://en.wikipedia.org/wiki/Middleware

What this means is we want to give you, our amazing users, a simple plug and play module in your desired framework be in Express in Node or Laravel in PHP, we want something you can quickly add to your existing tool chain and everyone working on the project have all the advantages of using Optic. We do have a couple of examples of what the middleware could be like for [Express and Hapi in the Node world](https://github.com/opticdev/optic-node/tree/main/frameworks), please feel free to comment or log issues that we can take and make it so much better for you.
## Feel like getting involved?
Optic is only a small organization, we can’t possibly work in every language with every framework. We welcome the communities' assistance in doing so. The amazing [Adrien Brault](https://github.com/adrienbrault) has already produced a [proof of concept for PHP](https://github.com/adrienbrault/optic-php).

If you’d like to help get us started and support our efforts to make this more accessible to your language or framework, then please feel free to contact me at mike.elsmore@useoptic.com, on twitter at [@ukmadlz](https://twitter.com/ukmadlz) or in the [Optic Discord](https://useoptic.com/docs/community/). Let’s make the experience of documenting our APIs easier for everyone :)
