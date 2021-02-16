---
date: "9/2/2020"
title: "API Changelogs on Every PR"
author: Aidan Cunniffe
author_url: "https://github.com/acunniffe"
author_image_url: "/img/team/aidan.jpg"
category: Release
---

Time after time I’ve encountered teams who understand the importance of API Change Management, but do not have the mechanisms in place to understand how their APIs change over time.

To me, this has always felt like it should in the bucket of ‘solved problems’. We have amazing change management tools for our code and our infrastructure, but not the APIs that are run by that code, on that infrastructure.

## Now Available: The Optic GitBot

Imagine a GitBot that made it easy for teams to understand how/when their APIs change. Enter the Optic GitBot, which automatically adds an API Changelog to Pull Requests within your project. With the bot installed, developers understand how each PR affects their API contract and can use these insights during code review.

When you open a PR, Optic diffs the specifications in your PR branch against the base branch to produce a semantic changelog, then comments on the PR. It's that easy.

<!--truncate-->

![alt](/img/blog-content/gitbot-large.png)

The Optic Bot is free and available to any team using Optic to maintain their API specifications. It takes 2 minutes to setup — [try it now](https://github.com/apps/optic-gitbot)!

## Solving the Hard Problems: How the Bot works

Automatically building an API Changelog is a hard problem because it relies on 2 hard problems under-the-hood: making sure your team’s API specifications stay up-to-date and designing a meaningful changelog.

**Keeping the specification up-to-date.** Most teams, even those that practice spec/design-first, do not have up-to-date API specifications. Diffing stale specs will yield poor changelogs making it difficult to create anything useful for change management.

Teams already using Optic rarely have this as a problem. Most adopted Optic because it detects API changes for their developers and makes documenting the changes as easy as making Git commits. Developers just have to approve changes "Yes, I meant to do that", instead of writing OpenAPI by hand.

**Making a Meaningful Changelog.** Useful changelogs make it easy to understand what’s changed at a glance, and reason the implications of those changes.

#### Here's an example of a clear, and semantic diff:

![alt](/img/blog-content/specific-changes.png)

#### And here's the same example line diff:

![alt](/img/blog-content/openapi-git-diff.png)


A line-diff is much harder to reason about, and more importantly, it's difficult to understand the scope of the changes. Because schemas are re-used, 1 line may affect multiple operations. You (the programmer) have to bring a lot of context to a raw diff like this. Where is this shared schema used? One operation? Many? In Responses or in Requests? A required field being made optional in a Request is not breaking, but in a Response the same change is considered breaking.

---

## Get Started with Optic + GitBot

*Not using Optic yet? Optic is an open source project that makes writing/maintaining your API specifications as easy as making Git commits. Learn more here* [https://useoptic.com/](https://useoptic.com/)

1. [For New Users] Add Optic to your API
2. Check-in your `.optic` folder to source control
3. Install the [Optic GitBot from the GitHub Marketplace](https://github.com/apps/optic-gitbot).
4. Open A PR

## What’s Next for the Bot

**When do breaking changes get introduced?** When the API changes

**When do bad design choices get introduced?** When the API changes

We believe the best place to do API Governance is at the point of change.

The Optic GitBot gives teams a process to ensures every API change gets reviewed, documented and approved. Right now, the bot simply provides visibility into changes, but soon, as more teams begin to adopt the GitBot it start nudging teams towards better designs with style guides, and prevent breaking changes from getting deployed.

Have other ideas? Want to pitch in? The Optic maintainers host office hours you can schedule [https://useoptic.com/docs/community](https://useoptic.com/docs/community)
