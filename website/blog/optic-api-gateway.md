---
date: "9/16/2020"
title: "Using Optic with your API Gateway"
author: Lou Manglass
author_image_url: "/img/team/lou.jpg"
category: Release
---

Optic helps teams write and maintain their first OpenAPI specifications. You don't need to get your team on-board to learn OpenAPI or worry about maintaining 10k line YAML files -- Optic takes care of all of that. Optic manages this process whether your development environment is running locally on your machine or out in the Cloud. No matter where you develop and test, you have confidence that every change to your API is reviewed, approved, and documented before it's released.

<!--truncate-->

## Manual Configurations for remote targets

When you [start configuring Optic](https://app.useoptic.com/) to work with your project, you'll be able to select from a recommended mode of setup and a manual mode. We have our (perhaps obvious) preference that you run through the setup in Recommended mode. This helps Optic assure your API project is up and running, is reachable, and wraps each invocation in a [capture session](https://www.useoptic.com/docs/#the-optic-proxy---how-optic-observes-your-apis-behavior) to organize your traffic observations.

![Paths to integrating Optic with your project](/img/blog-content/manual-choices.png)

We understand that not all APIs run locally: for example, you may have your development or test environment always on in a remote location. This is where Manual configuration comes in handy. Let's say I have a serverless application composed of AWS Lambda functions running behind an API Gateway in AWS. The environment is deployed via Terraform, and Lambda functions can be updated individually or in bulk with some scripts in our project repository. *phew*! There's a lot going on.

This is not a good fit for Recommended Mode: there's no good single command to invoke the API service (the code is spread across several on-demand Lambda functions running behind an always-on API Gateway) and the code in this case doesn't run locally on my development environment. Manual mode lets me define my API Gateway URL and my local entry point for observing traffic. Note that Optic fully supports HTTPS connections.

![Manual integrations with Optic](/img/blog-content/manual-definition.png)

When Optic is running, it will observe all traffic sent to port 5000 on localhost, forward that traffic to my API Gateway, and report the traffic in my local Optic Dashboard. Once Optic is running, all testing traffic to the API Gateway should go through my local Optic presence.

## Sending requests using Postman

If you're using [Postman](https://www.postman.com/), you can take advantage of **Environments** to set up different profiles for testing. For example, I might have a few different environments against which I like to run some requests. There's my personal development environment, the QA environment, and sometimes I like to see what's happening in Production. I could have three different environments set up.

![Postman](/img/blog-content/manual-postman.png)

Each environment in Postman contains user-defined variables. For simplicity, here I have one variable: `baseUrl` which defines the common URL for every API endpoint in each environment. For Optic, I'll pass traffic through `http://localhost:5000` which is what I defined earlier.

![Postman environment definition](/img/blog-content/manual-postman-environment.png)

By defining the `baseUrl` in an environment, I can write all of my requests the same way and determine where they go from the Environment drop-down. In this case, I want to run my test request against my Optic environment. I select the `API Gateway - Optic Local` environment that I just set up, and send off the request. Success! I get back a stubbed out response from my API Gateway, through Optic running on my local machine.

![Postman runs a request through Optic](/img/blog-content/manual-postman-optic.png)

## Automating requests with Newman

[Newman](https://www.npmjs.com/package/newman) is the CLI companion for Postman. You can export Postman collections and environments that Newman can then use to generate traffic from the command line. This is great way to build a book of requests for Optic to observe. That way, Optic has good coverage of your API project and can report on any changes. From Postman, I'll start by exporting my collection and then I'll export my environment as well. Now I have two files in my project directory: `apigw.postman_collection.json` for my collection, and `apigw-optic.postman_environment.json` for my environment.

![Exporting Postman collections for Newman](/img/blog-content/manual-newman-export.png)

I already have Newman installed, though it's available through several package managers such as `npm` (`npm install --global newman`) and Homebrew (`brew install newman`) if I didn't have it already. Running it is similarly invoked with a single command:

```
newman run apigw.postman_collection.json --environment apigw-optic.postman_environment.json

```

will run my collection using my environment I defined in Postman.

![Running Newman to generate traffic](/img/blog-content/manual-newman-run.png)

## Optic sees all

Newman shows the request ran automatically. I've run a few different tests this session to demonstrate several ways of managing request libraries. Optic was watching, silently, the whole time. The local dashboard (for me, available at `http://localhost:34444/apis/1/diffs`) shows that it observed 3 requests the `/v1/posts` route while I was working on these examples.

![The Optic Dashboard](/img/blog-content/manual-optic-dashboard.png)

Optic recognized the three responses all had a status code of `200`, and documented the shape of the response. It sees the field values, which are only ever observed locally, and then generates the documented shape of the fields by giving us the observed data types. This becomes part of the documentation, which can be shared with your team and API consumers. Note the values are no longer in the fields, as we don't share actual data values. These bodies can all be documented at once, setting a baseline expectation for this endpoint. If either the request or response traffic changes in the future, Optic will catch it the next time I run my Postman or Newman collection.

![Optic showing data shape](/img/blog-content/manual-optic-dashboard-2.png)

## Get started with Optic!

You can start documenting your API today by [setting up Optic](https://app.useoptic.com/) with your project. We can help you integrate with your existing documentation tools during our [office hours](https://useoptic.com/docs/community), and would be happy to take [feedback on GitHub](https://github.com/opticdev/optic/issues/new).