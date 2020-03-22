<h1 align="center">
  <br>
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
  <a href="#documentation">Documentation</a> •
  <a href="#license">License</a>
</p>

# How it Works

> Optic is like Git, but for your APIs

### Add Optic to your Development Enviroment

> Similar to `git init`

Add the Optic Proxy so Optic can learn how your API works. It only takes 5 minutes and will save you hours if you write
OpenAPI manually today.

```bash
yarn add global @useoptic/cli
api init
```

### Use the Optic Proxy to Monitor your API's Behavior

```bash
api start
[optic] Starting ToDo API on Port: 3005, with npm run server-start
```

<h1 align="center">
<img src="https://raw.githubusercontent.com/opticdev/optic/master/optic-docs.png" width="200">
</h1>

### Use Optic to Manage your API Specification

> Similar to `git diff`, `git add` and `git commit`

Optic constantly diffs your API's actual behavior against its specification. Optic shows you the API diff and makes it easy
to:

- Add new API Endpoints to your specification
- Update the specification when it observes new behavior for an existing API Endpoint
- Catch bugs and unexpected API behavior early :)

![gif](https://github.com/opticdev/optic/blob/742aae18220ececd7dc65093b4e786ada7fe65d0/webapp/public/optic.gif?raw=true)

# <a href="https://www.youtube.com/watch?v=y1XSUXbH3kQ" target="_blank">Watch a 3 minute Video Demo</a>

## Key Features

📝**Accurate API Documentation** - We built Optic to make maintaining accurate specs for your APIs automatic and developer
friendly. Once you add Optic to your API repo, it automatically tracks your API’s behavior and maintains a change log of its
behavior over time.

It’s kind of like Git, but instead of tracking files, Optic automatically diffs and tracks API endpoints. When new behavior
is observed, Optic makes it easy to update the spec.

⚙️ **Automated Testing** - Automate most of your contract testing. Optic uses live testing with spec coverage to make testing
APIs easy.

👍 **Beautiful Docs** - Stripe-style documentation for every API managed by Optic.

👋**100% Open Source, Runs locally, data is only stored in your API Repo**

## Documentation [https://docs.useoptic.com](https://docs.useoptic.com)

Read the full docs at: [docs.useoptic.com](https://docs.useoptic.com)

## License

MIT
