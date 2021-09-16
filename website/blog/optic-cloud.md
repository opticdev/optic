---
date: 2021-09-14
title: "Introducing Optic Cloud"
author: Aidan Cunniffe
author_url: "https://github.com/acunniffe"
author_image_url: "/img/team/aidan.jpg"
image: "/img/blog-content/opticcloud.svg"
category: Announcement
---

![alt](/img/blog-content/opticcloud.svg)

Hey all, it's Aidan, one of Optic's creators 👋. I'm here to share a preview of the [cloud version of Optic](https://cloud.useoptic.com/) and outline our plans for the future of the project. Buckle up, enjoy, and feel free to reach me and continue our conversation on [Twitter](https://twitter.com/aidandcunniffe) or [Discord](https://discord.com/invite/t9hADkuYjP).

<!--truncate-->

But first, let us back up. Why does this project even exist?

> Optic helps you go API-first, and bring your team with you.

If you are here, you probably have tried a lot of tools like OpenAPI, Stoplight, and Postman. You may have tried to put into practice good ideas like working "design-first". For many reasons, these tools did not solve your problems, or they asked too much of the developers on your team, limiting adoption. By building first for the developer and making writing API specifications as easy as checking-in code, Optic is working hard to take the great ideas the API space has refined over the years and make them mainstream.

### Optic 10 milestones

Since Optic 10 launched in June 2021, the project hit some important milestones:

- **First adoption from teams -** Before v10, Optic was mainly used by a single user — the team lead or someone in QA. Now we're seeing multiple API developers on the same team collaborating; using Optic to write down and discuss their API changes. The teams using Optic are usually 3-7 developers, with the largest team at 14, and are responsible for a single API inside a much larger company.
- **Shift towards "tracking changes” -** Recently, developers have been using Optic to show their (API) work. They will start working on a ticket, build a feature, and finish up by documenting their API changes with Optic. It's the last step the take before committing code with Git. Optic is not just detecting changes anymore, it’s helping teams be proactive and start conversations about their API.
- **Use in real environments —** Optic has monitored millions of API requests in staging and production environments. Some of this traffic is from teams participating in our [live traffic beta this summer](https://useoptic.com/blog/live-traffic-beta), but a surpassing amount of the traffic was collected by teams running the local CLI in production and an Optic daemon on-prem without official support from our team.

All of these milestones represent changes in how teams are using Optic and fitting it into their development workflow. Thanks to all the individuals and their teams that have put their trust in the tool, and spent their time helping us make the tool better for the community.

**The problem:** As usage has spread across teams and started to include outside stakeholders and consumers, users have started to run into the limitations of a local-only tool. Teams are building their own Docker containers with the local Optic CLI exposing changelogs, moving around massive captures from real environments, and trying to build their own API review workflows on top of the local tool. Having Optic run locally has helped the Optic maintainers focus on the core of Optic and not have to worry about building a backend, but that has come at the cost of making collaboration hard.

### A new API lifecycle, grounded in reality

We're not just moving Optic to the cloud, we're building a unified workflow for tracking changes, planning changes and reviewing changes that's grounded in the reality of how your APIs are actually working.

Without context about your team's planned changes, any monitoring tool that's looking at how your API behaves will be noisy. And without context about how the API is behaving in the real world, any API design process won't be grounded in reality.

Optic can detect API diffs across all the environments where your API is running, but what do these API diffs really mean? Well obviously, that depends on context:

- what environment did the diff appear in?
- when did it show up?
- did it appear because your team added a new endpoint?
- because you made a change to an existing field’s behavior?
- is the diff an indicator of a bug/serious regression.

Should someone on the team be alerted if Optic sees a change in production? Probably, right?

Wait, but what if that change was planned by the team "design-first", built by the engineers, and the diff in production is a sign that these changes were implemented correctly, and finally got deployed? Instead of sending an alert, Optic should kick off a celebration! You want to notify your consumers — this new capability is ready, and run a script to trigger a docs rebuild!

The context that mattered in this example comes from the API lifecycle, that's what gives meaning to the diffs, that's what ties the whole thing together.

Optic Cloud will **help you go API-first, and bring your team with you**. We're putting into practice everything you've taught us about the API lifecycle and building developer-friendly API tools.

### Design and build great APIs with Optic Cloud

In Optic Cloud we are delivering a unified workflow, getting opinionated, and reimagining the API lifecycle.

- **Developers show their work** using Optic. When they make API changes the tool helps them track those changes and get feedback / approval from their teammates
- **Plan changes "design-first"** when you want to. Discuss API changes, iterate on the design within Optic, and track the status of that change as it moves from a Pull Request → CI → Staging → Production.
- **Teams review API changes** before the changes get deployed. Make sure every API change (design-first or code-first) gets reviewed and approved before getting deployed. Your consumers and other stakeholders can be a part of this too.

And unlike other tools, **Optic uses evidence to ground the API lifecycle in reality.** With Optic, you always know which versions of each endpoint are running in each environment, when new behaviors go live, and which Pull Requests (code changes) changed the API.

**See for yourself more:**

- [Read the docs](https://docs.useoptic.com/docs)
- [Visit our website](https://cloud.useoptic.com/)
- [Blog: The API Lifecycle and Optic](https://useoptic.com/blog/api-lifecycle)
- [Blog: Making Design First and Code First work for Everyone](https://useoptic.com/blog/making-design-first-and-code-first-work-for-everyone)

### Join the beta
We'll be running Optic Cloud through a brief beta period, if you want to be take part in the beta and help influence how the team version of Optic is built, [sign up here.](https://cloud.useoptic.com/). We're looking forward to meeting you.

Right now we're looking for teams that:
- build internal or partner APIs
- comprised of 3-10 developers
- want to make sure all API changes are reviewed
- plan some changes ("design-first") and want to use Optic to ensure the implementation matches the design

**[Join the Optic Cloud Beta](https://cloud.useoptic.com/)**

##### We'll open sign-up to the public sometime this fall. We're still figuring out the details of the business model, but can commit now to offering a free-forever version of Optic Cloud that works like the open source project. We do plan to charge for the more advanced collaboration / approval workflows, and the ability to collect evidence from your deployed environments (ie staging and production).
