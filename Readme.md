
<h1 align="center">
  <br>
  <a href="https://useoptic.com"><img src="https://raw.githubusercontent.com/opticdev/optic/master/workspaces/ui/public/optic-logo.svg" alt="Optic" width="200"></a>
  <br>
  Optic
  <br>
</h1>

<h4 align="center">APIs that Document & Test Themselves</h4>

<p align="center">

</p>

<p align="center">
    <a href="#how-it-works">How it Works</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#documentation-httpsuseopticcomdocs">Documentation</a> •
  <a href="#license">License</a>
</p>


# How it Works

> Optic is like Git, but for your APIs

### Add Optic to your Development Environment 

Optic acts as a proxy, observing all API traffic during a session with your application. It's installed with the Yarn package manager, and initialized per API project you want to monitor.

> Similar to `git init`

Add the Optic Proxy so Optic can learn how your API works. It only takes 5 minutes and will save you hours if you write OpenAPI manually today.
```bash
yarn add global @useoptic/cli
# Navigate to your API project directory
api init
```

![The api start command initializing](https://www.useoptic.com/static/init-9a9c43677e29e2b6f9f04bd7ce81ec26.svg)

This will open a local, guided initialization flow. Optic will walk you through setting up your project in the Optic Dashboard. Once setup is validated, you're ready to start your API with Optic and observe API traffic locally to build your API specification and documentation. As part of the initialization flow, Optic creates an `optic.yml` file for you with your configuration:

``` yaml
name: project
tasks:
  start:
    command: echo "your project start command goes here"
    inboundUrl: http://localhost:4000
```

For further information, please check out our [setup instructions](https://useoptic.com/docs/getting-started/).

### Use the Optic Proxy to Monitor your API's Behavior 

Once set up, you can start observing traffic with the `api start` command. 

```bash
api start
[optic] Starting ToDo API on Port: 3005, with npm run server-start
```

Optic will start your application, and observe API requests run against it. Optic manages these observations in a capture session. When Optic observes traffic that it hasn't yet seen, or that has changed from previous observations, it will list it with examples of payloads in the Optic Dashboard for the capture session. As you make changes to your code, such as adding or updating API endpoints, Optic will establish new capture sessions for each build and report back on observed behavior.

Our detailed [setup instructions](https://useoptic.com/docs/getting-started/) will get you started with additional context for several popular languages and frameworks.

### Use Optic to Manage your API Specification 

Optic organizes the API traffic it observes to allow you to manage expected behavior. It reports the shape of your payloads, or the types of data observed, for documentation. If the shapes change from what has been observed previously, Optic will report those changes. This helps identify that a change in behavior has been implemented properly, or catches unexpected behaviors before they get out into the wild.

> Similar to `git diff`, `git add` and `git commit`

Optic constantly diffs your API's actual behavior against its specification. Optic shows you the API diff and makes it easy to:
- Add new API Endpoints to your specification 
- Update the specification when it observes new behavior for an existing API Endpoint 
- Catch bugs and unexpected API behavior early :) 

As you commit the observed diffs, Optic builds documentation in OpenAPI format on the fly. You can see how your documentation looks, and how it changes, right in the Optic Dashboard as you work.

### See it for Yourself

The best way to see Optic in action is to get [set up](https://useoptic.com/docs/getting-started/) in your current API project. You can also try our [interactive demo](https://demo.useoptic.com) to get a highlight of Optic's workflow and capabilities.

## Key Features
📝 **Accurate API Documentation** - We built Optic to make maintaining accurate specs for your APIs automatic and developer friendly. Once you add Optic to your API repo, it automatically tracks your API’s behavior and maintains a change log of its behavior over time.

It’s kind of like Git, but instead of tracking files, Optic automatically diffs and tracks API endpoints. When new behavior is observed, Optic makes it easy to update the spec.

⚙️ **Automated Testing** - Automate most of your contract testing. Optic uses live testing with spec coverage to make testing APIs easy.

👍 **Beautiful Docs** - Stripe-style documentation for every API managed by Optic.

👋 **100% Open Source, Runs locally, data is only stored in your API Repo**


## Documentation [https://useoptic.com/docs](https://www.useoptic.com/docs)

- Read the full docs at: [useoptic.com/docs](https://www.useoptic.com/docs).
- Want to contribute? Check out the [Contribution Guidelines](Contributing.md).
- To get set up working on the project, please review our [Developer Setup](Developer-setup.md) guide as well.

## License 

MIT

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-12-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://aidancunniffe.com"><img src="https://avatars1.githubusercontent.com/u/5900338?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aidan Cunniffe</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=acunniffe" title="Documentation">📖</a> <a href="https://github.com/opticdev/Optic/commits?author=acunniffe" title="Code">💻</a></td>
    <td align="center"><a href="https://devdoshi.com"><img src="https://avatars1.githubusercontent.com/u/1463179?v=4?s=100" width="100px;" alt=""/><br /><sub><b>devdoshi</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=devdoshi" title="Documentation">📖</a> <a href="https://github.com/opticdev/Optic/commits?author=devdoshi" title="Code">💻</a></td>
    <td align="center"><a href="https://www.take2.co/consulting-development"><img src="https://avatars2.githubusercontent.com/u/4691748?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Evan Mallory</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=esopian" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.jaaprood.nl/"><img src="https://avatars1.githubusercontent.com/u/857549?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jaap van Hardeveld</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=JaapRood" title="Code">💻</a> <a href="https://github.com/opticdev/Optic/commits?author=JaapRood" title="Documentation">📖</a></td>
    <td align="center"><a href="https://twitter.com/trulyronak"><img src="https://avatars1.githubusercontent.com/u/9388431?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ronak Shah</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=trulyronak" title="Code">💻</a> <a href="https://github.com/opticdev/Optic/commits?author=trulyronak" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/taraedits"><img src="https://avatars1.githubusercontent.com/u/52361229?v=4?s=100" width="100px;" alt=""/><br /><sub><b>taraedits</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=taraedits" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/LouManglass"><img src="https://avatars2.githubusercontent.com/u/241059?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lou Manglass</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=LouManglass" title="Code">💻</a> <a href="https://github.com/opticdev/Optic/commits?author=LouManglass" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/notnmeyer"><img src="https://avatars3.githubusercontent.com/u/672246?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nate Meyer</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=notnmeyer" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/timgates42"><img src="https://avatars1.githubusercontent.com/u/47873678?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tim Gates</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=timgates42" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/matthewhudson"><img src="https://avatars2.githubusercontent.com/u/320194?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Matthew Hudson</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=matthewhudson" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/lvenier"><img src="https://avatars1.githubusercontent.com/u/17571692?v=4?s=100" width="100px;" alt=""/><br /><sub><b>LaV</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=lvenier" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/gaurav-nelson"><img src="https://avatars2.githubusercontent.com/u/23069445?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gaurav Nelson</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=gaurav-nelson" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
