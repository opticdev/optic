---
date: 2021-07-22
title: "Your Optic changelog got better"
author: Mike Elsmore
author_url: "https://twitter.com/ukmadlz"
author_image_url: "/img/team/mike-elsmore.png"
category: Engineering
---

With the release of Optic 10, some amazing work has now been made available: everything from pieces to improve the experience (we'd love your [feedback on the new UI](https://portal.productboard.com/useoptic/2-optic/c/33-optic-ui-feedback) by the way), as well as features to make working together so much easier! And that's what we shall be covering here.

<!-- truncate -->

## Sharing
If you haven't installed the latest version of Optic, you'll have missed this little button in the top right corner of your documentation screen. That's right, you now have the ability to share your API spec with people in your team, or users at large. If you click the share button you will have the following options:

![Share Spec with your Team or External Consumer](/img/blog-content/share-api-spec-from-optic-ui.png)

Once you have gone through the login process you will be given two amazing little links, like the ones below:

![Links to share your API Specification](/img/blog-content/share-links-within-optic-ui.png)

That means you have a URL to an accessible copy of your documentation you can share with teammates, clients, or collaborators. On top of that, you get a markdown badge you can include in your READMEs to allow people to easily find the 	API Specification themselves.

Just think, no more having to get external collaborators or non-technical people to install [Optic](https://useoptic.com/docs) locally to be able to review the documentation. Now you can simply give them a link and let them review the endpoints and all the metadata about them.

## Changelog Bot
But why just stop at sharing a link to the documentation, how about making your pull requests more informative about endpoint changes? If you were unaware, Optic has a [GitHub Action bot](https://useoptic.com/docs/apiops/pull-requests) to make this possible, and with Optic 10 it became even more awesome.

After you follow the steps in [https://github.com/opticdev/optic-changelog](https://github.com/opticdev/optic-changelog) to add the bot to your repo it begins to register any changes in your API Specification with the pull request. Not only do you see the changes to the codebase but also the changes this causes to your API:

![GitHub Action Optic Changelog PR Message](/img/blog-content/github-action-changelog-pr-message.png)

You can see that `Review` link to each of the API Specification changes. These links take you directly to the relevant change within your specification. You can directly review how the code change impacts your API!

![Direct link to API changes in your API History](/img/blog-content/direct-link-to-api-changelog-history.png)

With the direct link, you can compare the diff between the pull request's version and the version it has changed from.

With the simple inclusion of a new GitHub Action you now have a lot more context and information within and directly accessible from your pull request when needing to review changes. You can see how easy it would be to see breaking API changes for users, or even where you'll just need to do something as simple as adding more documentation to clarify what's happening.

No more being reactive to API changes with your ever-evolving APIs, now you can quickly and simply share and discuss the changes with your collaborators and users. Now you can keep everyone in the know about all those changes simply and clearly.
