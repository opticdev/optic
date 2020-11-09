
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

### Add Optic to your Development Enviroment 

Optic acts as a proxy, observing all API traffic during a session with your application. It's installed with the Yarn package manager, and initialized per API project you want to monitor.

> Similar to `git init`

Add the Optic Proxy so Optic can learn how your API works. It only takes 5 minutes and will save you hours if you write OpenAPI manually today.
```bash
yarn add global @useoptic/cli
# Navigate to your API project directory
api init
```

![The api start command initializing](https://www.useoptic.com/static/init-9a9c43677e29e2b6f9f04bd7ce81ec26.svg)

Then, add your start command to the `optic.yml` file created by `api init`. This allows Optic to start your project and observe its request traffic.

``` yaml
name: project
tasks:
  start:
    command: echo "your project start command goes here"
    baseUrl: http://localhost:4000
```

For further information, please check out our [setup instructions](https://app.useoptic.com/).

### Use the Optic Proxy to Monitor your API's Behavior 

Once set up, you can start observing traffic with the `api start` command. 

```bash
api start
[optic] Starting ToDo API on Port: 3005, with npm run server-start
```

Optic will start your application, and observe API requests run against it. Optic manages these observations in a capture session. When Optic observes traffic that it hasn't yet seen, or that has changed from previous observations, it will list it with examples of payloads in the Optic Dashboard for the capture session. As you make changes to your code, such as adding or updating API endpoints, Optic will establish new capture sessions for each build and report back on observed behavior.

Our detailed [setup instructions](https://app.useoptic.com/) will get you started with additional context for several popular languages and frameworks.

### Use Optic to Manage your API Specification 

Optic organizes the API traffic it observes to allow you to manage expected behavior. It reports the shape of your payloads, or the types of data observed, for documentation. If the shapes change from what has been observed previously, Optic will report those changes. This helps identify that a change in behavior has been implemented properly, or catches unexpected behaviors before they get out into the wild.

> Similar to `git diff`, `git add` and `git commit`

Optic constantly diffs your API's actual behavior against its specification. Optic shows you the API diff and makes it easy to:
- Add new API Endpoints to your specification 
- Update the specification when it observes new behavior for an existing API Endpoint 
- Catch bugs and unexpected API behavior early :) 

As you committ the observed diffs, Optic builds documentation in OpenAPI format on the fly. You can see how your documentation looks, and how it changes, right in the Optic Dashboard as you work.

### See it for Yourself

The best way to see Optic in action is to get [set up](https://app.useoptic.com/) in your current API project. You can also try our [interactive demo](https://demo.useoptic.com) to get a highlight of Optic's workflow and capabilities.

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

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

