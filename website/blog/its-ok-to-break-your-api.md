---
date: "06/04/2021"
title: "It’s OK to Break Your API"
author: Aidan Cunniffe
author_url: "https://github.com/acunniffe"
author_image_url: "/img/team/aidan.jpg"
category: Community
social_image: its-ok-to-break-your-api.png
---

![alt](/img/blog-content/its-ok-to-break-your-api.png)

Great APIs _can_ integrate with anything, but in practice they don’t integrate with everything. Yet, much of the industry approaches their APIs like a fragile, priceless vase: not to be altered for fear of ruining their value and perhaps breaking it.

Simultaneously, these APIs are integrated with a growing number of real-world applications and systems. APIs connect the Internet to smartphones, sensors, and cars. They allow systems to communicate with each other and businesses to quickly add new features to applications. We want these things to work and they must be able to evolve.

Most organizations today produce more private and internal APIs than public APIs. So, the idea that an API must work for _everyone_ who may use it has become less relevant over time. However, if you build an API, it must still work well for users. And while most APIs have a small number of consumers, changes to an API can lead to _startling_ impacts in the real world. 

You can avoid these unexpected consequences when you change your API. All it takes is effective communication and building strong relationships between you and the consumers of your API.

## Unexpected Consequences in the Real World

If you’ve built an API, then you already have at least one use case in mind. After all, why does anyone build an API? To solve a specific problem happening in the real world. But the people who use your API may apply it to use cases that never occurred to you. It’s this fact that makes many organizations fear API changes. If one day you decide to change the API you built around a single use case, it could cause unexpected real-world problems. Also, if consumers don’t understand how your API works, changes they make could have unforeseen consequences. 

<center><iframe width="560" height="315" src="https://www.youtube.com/embed/YS8N4h7wi1E" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center>

For example, in an [interview with Erik Wilde](https://www.youtube.com/watch?v=YS8N4h7wi1E) I told a story of a major sports league that decided to upgrade all its cameras on the field. The league hoped to obtain better data about the players. The previous cameras had different levels of precision for averaging player attributes like how far a player ran or how fast they threw a ball. Some people at the league have jobs where they need to make important decisions based on player statistics. To do that, they apply complicated algorithms to player data. The upgrade to the cameras _broke all their algorithms_. 
 
We see more and more APIs become connected to real-world items. So, a change made by the API provider or the consumer can cause unintended consequences. That camera upgrade is not something an API schema check would detect. And it’s not something you would think of when building the API, nor are you going to write a test against. However, the results of the camera upgrade could have been avoided had there been a meta channel of communication next to the API. Through that meta channel, the API producer could have let the consumers at the sports league know that a field in the API response would behave differently soon.
 
Developers sometimes make changes to APIs that break things in the real world. And some developers rarely make any changes to their APIs because of _the fear of breaking something_.

## The Fear of Breaking Changes

If you’ve ever worked at a large enterprise, you know that they tend to build _many_ APIs. At many of these organizations, once those APIs are up and running, no one takes ownership of them nor manages them. No one looks at consumer feedback on the APIs and yet they don’t make any updates to their APIs for fear of causing breaking changes. You’ll often see old API endpoints, fields, and parameters that nobody uses anymore.

This fear of breaking changes comes at a cost:

- APIs get bigger, more complicated, and become confusing to use
- The APIs require more maintenance, and you accrue more technical debt
- You end up with a lot of redundant capabilities
- You can’t put new learnings in your domain model

You can eliminate your fear of breaking changes and the costs that come with it by _knowing_ your consumers. Talk with your consumers about API changes you plan to make and give them time to prepare. You’re not making breaking changes if consumers know the changes are coming and have time to make updates. You’re also not making breaking changes if you remove the things in your API no one uses.

If you communicate with API consumers to find out what parts of the API you can remove safely, you can reduce the API surface area and create better relationships with your consumers. Better communication not only makes it ok for you to break your APIs but also helps you improve your APIs.  

## Better Communication Means Better APIs 
 
The developer who built the API used by the sports league didn’t think about how the API would behave if it was used in a camera system that got upgraded later. The developer probably thought they were only coding a statistics endpoint that returns numbers from a database. They had no way of knowing how that endpoint was being used or that a camera upgrade would change the behavior of that response field.

![alt](/img/blog-content/basic-diff.png)

To avoid unintended API-related consequences requires effective communication between API producers and API consumers. If there had been ongoing communication, the API producer would have known that the sports league planned to upgrade their cameras. The sports league would know that the API is used to power a regression and analyze player performance. The API producer would have been aware that changing that field could cause a problem for the sports league.

If you build an API, you need to _tell_ consumers how it works and when you have plans to change it. You also need to make sure that consumers _tell you_ how and why they use your API. You need to improve communication and create relationships with the people who consume your API. Without an API relationship, you risk causing unprecedented problems for people who depend on your API.

 
## Build API Relationships with Optic

To avoid your own API-shattering moments requires the confidence to make changes with the knowledge of what will be affected. You can get feedback from API consumers before you make changes—or potentially even let them know what will change for their specific integration.

Building relationships with API consumers can be as simple as an email dialogue. Usually, as changes occur, you’ll want to share technical details. These may come the form of API descriptions, response data diffs, and even staging servers. Richer API communication helps you create better APIs.

We’re building tools that help you build relationships through these technical details, without writing tests or enforcing a new workflow. [Optic](https://useoptic.com/) provides a meta channel where you can have conversations with API consumers and access a ledger with all the history of your API. With Optic, you can make changes to your API without the fear of breaking something in the real world. You can stop focusing on preventing breaks and start making breaks responsibly.

[Try Optic today](https://useoptic.com/) and let us know how we can help you confidently break your API.
