
<h1 align="center">
  <br>
  <a href="https://useoptic.com"><img src="https://raw.githubusercontent.com/opticdev/optic/develop/optic-png.png" alt="Optic" width="200"></a>
  <br>
  Optic
  <br>
</h1>

<h4 align="center">APIs that Document & Test Themselves</h4>

<p align="center">

</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#license">License</a>
</p>


# How it Works
### Add Optic to your Development Enviroment 
Add the Optic Proxy so Optic can learn how your API works. It only takes 5 minutes and will save you hours if you write OpenAPI manually today.
```bash
yarn add global @useoptic/cli
api init
```

### Turn on the Optic Proxy to Monitor your API's Behavior 
```bash
api start
[optic] Starting ToDo API on Port: 3005, with npm run server-start
```
<h1 align="center">
<img src="https://raw.githubusercontent.com/opticdev/optic/develop/watch.png" alt="Optic" width="200">
</h1>


![screenshot](https://raw.githubusercontent.com/opticdev/optic/master/webapp/public/optic.gif)

## Key Features
📝**Accurate API Documentation** - We built Optic to make maintaining accurate specs for your APIs automatic and developer friendly. Once you add Optic to your API repo, it automatically tracks your API’s behavior and maintains a change log of its behavior over time.

It’s kind of like Git, but instead of tracking files, Optic automatically diffs and tracks API endpoints. When new behavior is observed, Optic makes it easy to update the spec.

⚙️ **Automated Testing** - Automate most of your contract testing. Optic uses live testing with spec coverage to make testing APIs easy.

👍 **Beautiful Docs** - Stripe-style documentation for every API managed by Optic.

👋**100% Open Source, Runs locally, data is only stored in your API Repo**

## Documentation [https://docs.useoptic.com](https://docs.useoptic.com)

## License 
MIT
