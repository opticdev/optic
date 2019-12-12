
<h1 align="center">
  <br>
  <a href="https://useoptic.com"><img src="https://raw.githubusercontent.com/opticdev/optic/develop/optic-png.png" alt="Optic" width="200"></a>
  <br>
  Optic
  <br>
</h1>

<h4 align="center">Automated documentation, tests, and change management for your APIs</h4>

<p align="center">

</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#installing-optic">Installing Optic</a> •
  <a href="#license">License</a>
</p>

![screenshot](https://raw.githubusercontent.com/opticdev/optic/develop/webapp/public/netlify.png)

![screenshot](https://raw.githubusercontent.com/opticdev/optic/develop/webapp/public/optic.gif)

## Key Features
📝**Easily Document any API** - We built Optic to make maintaining accurate specs for your APIs automatic and developer friendly. Once you add Optic to your API repo, it automatically tracks your API’s behavior and maintains a change log of its behavior over time.

It’s kind of like Git, but instead of tracking files, Optic automatically diffs and tracks API endpoints. When new behavior is observed, Optic makes it easy to update the spec: 
![screenshot](https://raw.githubusercontent.com/opticdev/optic/develop/webapp/public/changes.png)

🎨**A powerful API designer** - Optic ships with an open source API design tool that makes it easy to read and modify your API specification. 

👋**100% Open Source, Runs locally, data is only stored in your API Repo**

## How to Use
Optic learns and monitors your API's behavior by using a local proxy. To run your API with the Optic proxy in front of it, use Optic's `api start` command instead of `npm start`, `rails server`, etc. 

```bash
demo$ api start
[optic] Starting ToDo on Port: 3005, with npm run server-start

> tododemo@0.1.0 server-start 
> babel-node server/server.js
```
Your API will behave normally when you run it with `api start`, but when Optic observes behavior that isn't in your API spec, it notifies you:
```bash
[optic] New behavior was observed. Run api spec to review.
```
Seeing this message means that Optic has observed a non-empty diff between your API specification and your API's actual behavior. You can review this diff by running `api spec` and either merge Optic's proposed changes into your API spec or mark the new behavior as a bug. Here's a 5 min video showing this entire process end-end:
### [Watch Video on Youtube](https://www.youtube-nocookie.com/embed/WjC4Fqyyi5E)

## Installing Optic
```bash
npm install @useoptic/cli -g
# or using yarn
yarn add global @useoptic/cli
```
## [Guided Setup Tutorial](https://dashboard.useoptic.com)

## License 
MIT

## Analytics 
We're collecting basic analytics in the CLI to help us improve Optic. Data is collected under an anonymously. No HTTP traffic sessions are ever tracked or reported back. We track which actions are taken in the API designer, but not the properties of those actions. So we know a user 'added a 200 response' but we know nothing about it.

We're working on adding an easy way to opt-out that will be documented here soon. 
