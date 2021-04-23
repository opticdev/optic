---
date: "4/21/2023"
title: "When Real Traffic Smashes into your API"
author: Aidan Cunniffe
author_url: "https://github.com/acunniffe"
author_image_url: "/img/team/aidan.jpg"
category: Release
---

:::note **Beta Alert:**
Starting today, you can now run Optic in Real API Environments. [Sign up here](https://4babutyltxb.typeform.com/to/qd6PHfHI)!
:::

![alt](/img/blog-content/lhc.jpg)

Once our APIs are deployed in a real environment like staging or production, traffic races in from all directions, interacting with the API in the ways we expect, and in ways we could never anticipate. These 'surprises' can teach us things and help us build better designed and more robust APIs.

Physicists smash particles into one another in giant particle accelerators looking for surprising patterns, and for new information that questions their assumptions about reality.

When we put our APIs in the path of real traffic, reality smashes into our API specifications, our well-landscaped-happy-paths, and our assumptions. We learn, revise, and improve our work -- hopefully.

There is so much to be learned from looking at our API's actual behavior and usage in the real-world. But are we really looking? Can we tell if our APIs are working as expected from the logs we collect today?

Users have long asked for options to run Optic in real environments to get more observability into their API's real behavior. We have even observed teams using the local-cli in their real environments without official tooling or support from the main project. Now you can join [the beta and start monitoring your deployed APIs with Optic](https://4babutyltxb.typeform.com/to/qd6PHfHI). You can also check out [the docs to learn more about how the integrations work](/docs/deploy/live).

![alt](/img/blog-content/optic-contract-testing-diagram.svg)

## API Observability

Most API logs contain only the URL, method, status code, timing information, and some open-tracing telemetry. This log level is like a magnifying glass, but to understand our API's real-world behavior we need a microscope. With deeper observability, you begin to tackle a new set of questions and use insights from real environments to make better decisions throughout the API lifecycle.

- Is the API working as designed? Is it meeting its contract?
- Are there additional fields (maybe even some sensitive ones) being returned?
- How are users interacting with our API? What patterns, flows and use cases are most important?
- Are there endpoints we did not document or test that users are working with?
- Who are our consumers? What subset of our API does each of them use?

#### Challenges meet Open Source Solutions
Today's API logs are limited for good reasons: logging API bodies in a privacy/security conscious way is a hard problem. How do you log enough data to detect errant API behavior or security issues without also logging PII or sensitive information? tl;dr Sanitizing is hard.

We need a new standard for API logs, something privacy/security friendly by default, that can tell us much more about our API's real-world behavior than our current logging approaches.

Optic built and open sourced the [`shape-hash`](https://github.com/opticdev/shape-hash) which logs only the schema/shape of your API bodies, but not the actual user data. If you have sent the Optic contributors a [Debug Capture](/docs/using/troubleshooting) you have already used `shape-hash`.

Now we're doubling down and collaborating with a team of Cloud Provider/APM/Logging veterans to develop the next version of our API logging format. It's a much more powerful and secure open logging format for APIs that we hope the industry can adopt as a standard. *Stay tuned for more information*

<div style={{maxWidth: 400}}>

![alt](/img/blog-content/shape-hash.png)

</div>

### Get Documentation and Observability for Every API
Have an existing API that needs to be documented? Or 10? Or 100?

With a few hours of monitoring real API behavior, Optic can help you rapidly document any API you point it at. Deploy Optic monitoring, go to sleep, come back a day later, and your API will be accurately documented.

Once the API is documented, Optic will keep monitoring the API behavior to ensure every API change gets reviewed and approved before getting deployed.

![alt](/img/blog-content/document-your-api.png)

### Use Real Traffic for Contract Testing
When Optic runs in Staging or QA environments, it reports on the API behavior of every deployment. All the traffic from these environments is monitored and helps test your API contract. It's like running the `api status` command, but for all the traffic captured in the real environment.

Everything your team already does in these environments now becomes part of how your API is tested: manual tests, automated tests, integration tests, and even the traffic from developers using the service while programming.

By taking all this test traffic into account, API test coverage increases substantially, without requiring your team to write or maintain tests by hand.

![alt](/img/status-highlight.png)


### Map Dependencies and Manage Changes
By watching how all your services interact, Optic can map the dependencies between them. This is invaluable when trying to understand the impact of any API change or planning sunsets / deprecations.

Imagine if this information was available to you when you were designing APIs or talking about changes to existing services?

- Will anyone be affected by changing an endpoint? Who?
- Which APIs are no longer used? Are they safe to delete?
- What request parameters do users send? What request parameters are no longer used?

Future versions of Optic's GitBot will make these insights available at design time and when talking about API changes in code review: _i.e._ "This will be a breaking change for teams x,y,z's usage pattern!".

### \[Insert your Magical Use Case\]
What questions do you have about how your APIs are consumed? What tools, alerts or reports would you build if your logs had better API observability?

We want to hear from you. [Feel free to start a discussion on Optic's GitHub](https://github.com/opticdev/optic/discussions/new)

---

## Use Optic to Monitor APIs in Real Environments

Interested in running Optic in your real environment? Want to be part of designing how we build API observability into the Optic project? Join the beta ⤵️

### **[Sign up for the beta](https://4babutyltxb.typeform.com/to/qd6PHfHI)**

