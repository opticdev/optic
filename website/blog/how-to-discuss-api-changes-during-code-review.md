---
date: "6/29/2021"
title: "How to Discuss API Changes During Code Review"
author: Karl Hughes
author_url: "https://www.karllhughes.com"
author_image_url: "/img/people/karl-hughes.png"
category: Community
# social_image: social-api-testing-methods-and-best-practices.png
---

<!-- ![alt](/img/blog-content/social-api-testing-methods-and-best-practices.png) -->

[Code reviews](https://smartbear.com/learn/code-review/what-is-code-review/) are an essential part of any high-quality software development process. A thorough code review can prevent bugs and regressions from slipping into production, improve code quality and consistency, and ensure your team knows about important changes before they go live.

While looking at code can help you find flaws in your logic, **it's notoriously hard to trace changes through your application to see how they might actually affect your API.**

For example, I remember a situation a few months ago where I unintentionally introduced a breaking change into one of our company's APIs. Our automated tests didn't catch it because the field I removed was optional and not thoroughly tested. The teammate who reviewed my code was focused on the core set of changes I made, so she missed the subtle breaking change as well.

We didn't find out about the error until our next production release when logs and customers started to make noise about it. Needless to say, that's never a good thing.

Breaking changes like mine could probably be prevented with more thorough automated tests, but in many cases, tests are not enough.

Let's say you're maintaining a microservice that is used by dozens of engineering teams throughout your organization. Communicating changes is essential but extremely time-consuming and error-prone. Teams who do this well might write detailed changelogs, keep thorough release notes, or maintain multiple documented versions of their APIs, but none of these solutions are perfect. **They rely far too heavily on manual effort and simply being careful.**

## Introducing Optic

> "In a world of distributed computation and independently evolving systems, understanding how all the APIs work, and knowing when they change, has become an essential facility...We have good toolchains for managing code changes (Git), but when it comes to the behavior of that code we rely on tribal knowledge, manually written and updated specs, and incomplete tests." –[Aidan Cunniffe, founder at Optic](https://useoptic.com/blog/git-for-apis)

Situations like the ones above are where [Optic](https://useoptic.com/) shines. Optic is a developer tool that allows you to see even the smallest changes to your API _before_ they go live.

Using Optic, you can generate API diffs much like code diffs in version control systems, and with the [Optic Changelog GitHub Action](https://github.com/opticdev/optic-changelog), **you can incorporate these diffs directly into your code review process**. Having this kind of high-level insight into how your code affects your API's final contract is incredibly valuable in today's API-driven world of interconnected systems.

In this tutorial, you'll see how you can set up Optic to track and document your API locally. Then, you'll see how to incorporate Optic's reports into your code review process using the Optic GitHub Action (which replaces the deprecated Optic GitBot). Using this free tool, your team can catch and prevent regressions, quickly see subtle changes to your API, and start conversations around changes that might need further discussion.

## Using Optic to Review and Discuss API Changes During Code Reviews

For this tutorial, I'm using a fork of the [sample-node-api](https://github.com/zowe/sample-node-api) project. You can find the final code [here on GitHub](https://github.com/karllhughes/sample-node-api) or follow along with the tutorial to set this up in your own API. While this tutorial uses Node.js, Optic supports any web development server and [most major frameworks](https://useoptic.com/docs/integrations/integrations).

### Adding Optic to Your API

The Optic command-line interface (CLI) requires Node version 12+. Assuming you have a recent version of Node installed, run the following to install the CLI:

```shell
npm install @useoptic/cli -g
```

The [Optic Quick Start guide](https://useoptic.com/docs/) also includes instructions for setting up Optic using [Yarn](https://yarnpkg.com/) or [Homebrew](https://brew.sh/) if you prefer.

To verify the installation, run:

```shell
api --help
```
 
![Optic CLI help output](https://i.imgur.com/TgUlwsD.png)

Next, you need to initialize Optic in your project's root directory.

```shell
cd /path/to/api && api init
```

The prompt will walk you through some basic questions and create an [Optic configuration file](https://useoptic.com/docs/get-started/config) in your project's root directory.

![Output for the api init command](https://i.imgur.com/Mj5r08E.png)

Optic works by observing requests to your API endpoints and tracking the way your application responds. If responses change during development, Optic will track them so you can review them before you push the changes to your team to review.

To finish setting up your API, visit the link created by Optic after initialization. Add the start command for your application and the port your API will run on so that Optic can intercept requests and monitor changes.

![Optic configuration walkthrough](https://i.imgur.com/tD4YhF9.png)

In the case of the `sample-node-app`, the start command is `node src/index.js`, and the URL is `http://localhost:18000`.

I had to make one small change to the sample application to ensure that the API runs on a port that Optic can control using the `$PORT` environment variable. If you're following along with the sample application, update the `port` option in the `src/config.js` file:

```javascript
...
    .option('p', {
    alias: 'port',
    description: 'listening port',
    default: (process.env.PORT || 18000) // This enables the API to use the $PORT environment variable
    })
...
```

To check that Optic is set up properly, run the following in your terminal:

```shell
api check start
```

![Verifying that Optic has been set up properly with the CLI](https://i.imgur.com/tZiKzJj.png)

Now that Optic is set up, you're ready to build your baseline API spec so that you can then use it to review changes with your team.

### Building Your Baseline API Specification

Optic watches your API as you use it to record its behavior and detect changes. You can learn more about [how Optic builds your API spec here](https://useoptic.com/docs/using/baseline).

In the real world, you'll typically use Optic while you run your end-to-end tests, but for this tutorial, I'll use [curl](https://curl.se/) to call the endpoints manually.

First, start your API with Optic:

```shell
api start
```

Next, you need to call your API endpoints. To keep things simple, I'll just call the `/accounts` and `/accounts/{id}` endpoints:

```shell
curl --location --request GET 'http://localhost:18000/accounts'
curl --location --request GET 'http://localhost:18000/accounts/0'
curl --location --request GET 'http://localhost:18000/accounts/1'
curl --location --request GET 'http://localhost:18000/accounts/2'
curl --location --request GET 'http://localhost:18000/accounts/3'
curl --location --request GET 'http://localhost:18000/accounts/4'
```

Load the Optic API Diff locally at `http://localhost:34444/apis/1/review`. This shows you that you have six undocumented endpoints.

![Undocumented endpoints in the Optic API Diff](https://i.imgur.com/ItPXhhh.png)

If this is the first time you've run this API, you need to add each of these endpoints, define the dynamic parameters, and describe them for Optic.

![Using Optic to describe endpoints](https://i.imgur.com/Ti5KAcg.png)

When done, finalize the changes, and Optic will automatically add them to your documentation.

![Finalizing your API changes in Optic](https://i.imgur.com/kG3pGxF.png)

You can also describe each endpoint on the documentation page.

![Describe each endpoint](https://i.imgur.com/UKoWrXO.png)

Once you've completed the baseline documentation for your API, Optic will continue to document new endpoints as they're added, updated, and removed. In the next section, you'll see what updated endpoints look like and how to review changes before you push them to GitHub.

### Reviewing API Diffs Locally with Optic

To affect a change to your API, open up the `src/data.js` file and add a new field to each account called `'language'`:

```javascript
...
    {
      '_id': '0',
      'name': {
        'first': 'Deidre',
        'last': 'Hayes'
      },
      'email': 'deidre.hayes@undefined.me',
      'phone': '+1 (839) 577-3100',
      'address': '507 Church Avenue, Heil, Wyoming, 1754',
      'language': 'English'
    },
...
```

Restart the API by stopping and running `api start` again. Call the same six endpoints you did before so that Optic can see the changes and then head to `http://localhost:34444/apis/1/review` to review them.

![Optic shows the diff of each endpoint](https://i.imgur.com/RHFNEPd.png)

Optic shows you the new field on each endpoint, so you can understand what changed and ensure that you didn't accidentally break anything in your API. Since these changes are intentional, click **Approve** in the upper right-hand corner. Optic will add the new field to your documentation.

If there's a bug or regression in your API, you can use the **mark as incorrect** option.

![Marking a change as incorrect in Optic](https://i.imgur.com/VCwxjhi.png)

Marking changes as incorrect will keep your API spec unchanged and hide them from the diff. If the incorrect behavior is still present in future API calls, Optic will let you know to make sure you fix the error.

Now that you've seen how to review changes to your API locally with Optic, you're ready to see how Optic can work with your team on GitHub.

### Using Optic GitHub Action to Discuss Changes with Your Team

Optic automatically adds a `.gitignore` file to ignore your captured endpoints, but you should check the following files into your GitHub repository:

- `optic.yml`
- `.optic/api/specification`
- `.optic/ignore`
- `.optic/.gitignore`

Next, you can add the [Optic GitHub Action](https://github.com/opticdev/optic-changelog) by creating a new file in your repository at `.github/workflows/optic-changelog.yml`:

```yaml
name: optic-changelog
on: [pull_request]
jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: opticdev/optic-changelog@main
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
          OPTIC_API_KEY: ${{secrets.OPTIC_API_KEY}}
```

If you haven’t created an Optic account yet, go to [app.useoptic.com](https://app.useoptic.com/) and log in using GitHub. Optic will generate an API Key which you can add to [your repository’s secrets](https://docs.github.com/en/actions/reference/encrypted-secrets).

![Getting your Optic API key](https://i.imgur.com/Be6338j.png)

Once you've checked in the relevant Optic files and GitHub action, push the changes to your repository. This Optic Changelog action will leave comments on any pull requests that include changes to your API, allowing your team to quickly review and discuss changes or new functionality without digging into every line of code.

To demonstrate this, create a new branch in your local repository:

```shell
git checkout -b api-change
```

This time, you'll simulate a breaking API change by removing the `'phone'` field from each of the Account records in the `src/data.js` file:

```javascript
...
    {
      '_id': '0',
      'name': {
        'first': 'Deidre',
        'last': 'Hayes'
      },
      'email': 'deidre.hayes@undefined.me',
      // 'phone': '+1 (839) 577-3100',
      'address': '507 Church Avenue, Heil, Wyoming, 1754',
      'language': 'English'
    },
...
```

Start your API using `api start`, approve the changes in Optic, and finalize them. Optic will update your specification file as needed.

Commit your changes, push the new branch to your GitHub repository, and open a pull request. The Optic Changelog GitHub Action will show you which endpoints have changed.

![Optic’s GitHub Action summarizes your API changes](https://i.imgur.com/BtmwzdW.png)

You can dive in deeper by clicking “Review” to see exactly which API requests were affected.

![Showing changed API endpoints in Optic](https://i.imgur.com/h4xgAgQ.png)

Anytime a pull request is opened, the Optic GitHub Action will compare the new specification to the specification file in the base branch. Then it summarizes the differences in a comment, allowing your teammates, API consumers, or QA team to quickly assess how your changes might affect the API in the real world.

These open comments are also a great place to have discussions with your team, tag users who need to know about the changes, and suggest updates.

## Conclusion

Code reviews are an important part of a robust software development process. While reviewing code line by line has its place, it's also extremely helpful to know what the end result of your code change is on your application's output. Tests can help you catch some things, but having an API diff built into your code review process is another great addition to your process.

[Optic](https://useoptic.com/) can automatically document your APIs, detect changes, and as you've seen in this tutorial, help facilitate discussions during your code reviews. Additionally, Optic is [free and open source](https://github.com/opticdev/optic), so there's no excuse not to give it a try today.