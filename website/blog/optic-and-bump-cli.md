---
date: "12/21/2020"
title: "Generating Documentation with Optic and Bump in your CI/CD pipeline"
author: Lou Manglass
author_image_url: "/img/team/lou.jpg"
category: Built with Optic
draft: true
---

Let's say I have a new project I've been working on in Ruby on Rails. One thing the world is definitely short on is blog platforms. I've started generating some API endpoints to power my new blog. I already have users, posts, and comments. Each of these can be created, updated, or deleted. All of this is managed through a RESTful API, thanks to Rails. It's manageable for right now, but it's only going to get more complicated as I move along. Plus, I want everyone in the world to blog on this platform. We'll need well documented interfaces for UI developers and power users.

As much as I appreciate a bespoke, hand-crafted, artisanal API documentation, I don't really have the time to manually keep the documentation up to date. Especially in the first few stages, I'll be iterating rapidly on the API. I need something to help me keep up to date in an automated fashion. I've chosen to use Optic to observe my API and keep my specification up to date, and Bump to generate documentation for me so I can capture bloggers early.

Blogging is still totally a thing, right? That people do? You know what, don't answer that.

<!--truncate-->

## Initialize Optic and Generate an Initial Specification

The first step to documentation is to define the expected behavior of my blog's API. Optic does a great job of watching me test my work and building a specification as I go along. Optic's CLI is available for [download and install](/docs/) through various package managers such as `yarn`, `npm`, and `brew`.

After running `api init`, Optic guides me through setup. It recommends configurations for my framework of choice, and helps me validate my configurations with automated checks. Of course, no integration plan ever survives contact with a project, or something to that effect. If I run into issues, the failed checks provide verbose information on the nature of the issue and suggestions for remediation.

![Optic guided initialization](/img/blog-content/bump-cli-optic-guided-init.png)
As soon as I've run my checks, I'm ready to start Optic. From now on, I'll run Optic's `api start` command any time I'm ready to work on my project. This assures my project starts up and Optic can observe my requests. Optic inspects all of my local API traffic and uses these observations to help me build my specification. When my API's behavior changes, Optic will report that to me. To start, Optic generates an initial specification from traffic observed with its automated learning process.

![Optic generating your API's initial specification](/img/blog-content/bump-cli-optic-generate-baseline.png)

## Set up Bump CLI

I now have a baseline specification, and I can use Optic to keep that up to date. It's not really human readable, though. I'd like to generate some friendly documentation with Bump. Following Bump's [installation guide](https://help.bump.sh/bump-cli), I've added `gem 'bump-cli'` to my Gemfile, and ran `bundle install` to get it set up for my project.

Bump CLI takes in an API specification file, such as an OpenAPI file, and sends that to the Bump servers to be prettified into human readable documentation. Bump provides a preview function that lets me test the process. I can generate an OpenAPI 3 file from Optic with `api generate:oas`, and preview it with `bump preview .optic/generated/openapi.yaml --specification openapi/v3/yaml`. Bump provides me a link, and I can see that my basic API and examples with `curl` are ready to go:

![Bump Documentation from Optic Specification](/img/blog-content/bump-cli-bump-documentation.png)


## Automating Bump Documentation with Optic Scripts

Looking good! Now, let's make this as simple as possible. Right now, there's multiple steps and any one could cause issues. If I forget to generate the new OpenAPI specification, I could be working with outdated information. Also, do I really want to have to remember where my generated files are located? Optic Scrips will handle this for us. Not only does this minimize what I need to keep in mind when developing my project, it sets me up to automate this later in my CI/CD pipeline. I've set up the following [Optic Script](https://www.useoptic.com/docs/faqs-and-troubleshooting/scripts) in my `optic.yml`file, which now looks like this.

```
# optic.yml
name: "blog"
tasks:
  start:
    command: rails server -p $PORT
    inboundUrl: http://localhost:4000
scripts:
  bumpcli-preview:
    command: bump preview .optic/generated/openapi.yaml --specification openapi/v3/yaml
```

Now I can run `api scripts bumpcli-preview` any time I want to see how the latest specification of my API would look on Bump.

```
$ api scripts bumpcli-preview
[optic] Found Script bumpcli-preview
Checking bin dependencies Requiring []... ✓ All dependencies found
Generating OAS file...
[optic] Generated OAS files
...
Running command: bump preview .optic/generated/openapi.yaml --specification openapi/v3/yaml
Preview created : https://bump.sh/preview/51bd23ff-e58f-46ff-b163-682462a89475 (expires at 2020-12-10T22:52:16+01:00)
```

## Create a GitHub Action

Remember when I said we could automate this process? Well, I do! I want to publish updated documentation every time I push to my `main` branch in GitHub. I can trigger this with GitHub Actions. I've used the basic template for a Ruby project, and modified it just a bit to run an Optic Scripts command:

```
# .github/workspaces/ruby.yml
name: Ruby

on:
  push:
    branches: [ main ]

jobs:
  test:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Set up Ruby
      uses: ruby/setup-ruby@21351ecc0a7c196081abca5dc55b08f085efe09a
      with:
        ruby-version: 2.7.0
    - name: Install dependencies
      run: bundle install
    - name: Install Optic
      run: npm install @useoptic/cli
    - name: Upload Bump documentation
      env:
        BUMP_ID: ${{ secrets.BUMP_ID }}
        BUMP_TOKEN: ${{ secrets.BUMP_TOKEN }}
      run: node_modules/.bin/api scripts bumpcli-deploy
```

Notice the script I'm running is `bumpcli-deploy`. We haven't defined that script yet. I'm going to follow along in Bump's [installation instructions](https://help.bump.sh/bump-cli) to validate and deploy a specification as documentation. The validation step will return an errors list, so if there's ever any issue with the specification file I can check my GitHub Actions log for more information. Then, it'll attempt to deploy the latest specification. I've included the script definition below.

```
# optic.yml - new script

  bumpcli-deploy:
    command: |
      bump validate .optic/generated/openapi.yaml --specification openapi/v3/yaml --doc $BUMP_ID
      bump deploy .optic/generated/openapi.yaml --specification openapi/v3/yaml --doc $BUMP_ID
```

Also, I've included two environment variables in the workflow definition. While Bump will allow unauthenticated file previews, Bump requires an account to validate or deploy documentation. Bump provides a Documentation ID and an Access Token, to identify the project you're documenting and grant authorization to send an updated specification. These are provided in the Bump dashboard. Since the Access Token must remain private, and I don't need the Documentation ID anywhere else in my project, I've added these to my GitHub repository under Settings > Secrets. This makes them available to my GitHub Action as secrets, which I've passed into my environment in the workflow definition.

![GitHub Action in action](/img/blog-content/bump-cli-action-ran.png)

## Documentation That's Always Up to Date

In theory, my documentation should be updated on Bump every time I push to `main`. Let's test that out. Locally, I'll run `api start` to spin up my project and the Optic proxy. I'll send a `POST` request to add a new user.

![Adding a new POST endpoint](/img/blog-content/bump-cli-add-post-endpoint.png)

Optic observed this traffic, and brought it to my attention in the Optic Dashboard running locally. I can review the request and response, and make sure it's what I intended. Notice the "password" field here, with the example on the left. Values are only ever seen locally. The only information stored in the Optic specification (and thus sent to Bump's servers) is the documented shape, on the right. Ideally, you wouldn't be testing with valid secrets. Even if you are, we'll only ever look at those values locally to determine the traffic shape.

![Optic reports a new POST endpoint](/img/blog-content/bump-cli-optic-post-diff.png)

I'm ready to have this new route go to the main branch and be documented on Bump. Normally I'd have a feature branch for my work, run some tests while watching Seinfeld, yadda yadda yadda. In this case, I want results now. I'll commit my changes and push them up to GitHub on the `main` branch. That will trigger the GitHub Action, which will validate my specification and send it off to Bump to be documented. Look at that: Bump now has my "Add a new user" endpoint!

![The Bump documentation is automatically updated](/img/blog-content/bump-cli-bump-updated-documentation.png)

## Try it today

If you're developing an API project on Ruby, you should give Optic and Bump a try today. It's a great way to build and maintain your API specification and documentation with minimal effort, and also gives you immediate feedback in your local development work. The best time to catch an unintended change is when you make it. If you have further questions or want to customize how your configurations or GitHub Actions, I'm happy to chat! Please reach out at `lou@useoptic.com`. I'd be happy to get more specific, and if you don't mind, share the results in a future blog post.

Please feel free to [get started](/docs/) on your own as well, and [reach out to us](https://calendly.com/optic-onboarding/setup-help) for a chat if you have some time.

## Resources

- [Optic installation](/docs/)
- [Bump installation guide](https://help.bump.sh/bump-cli)
