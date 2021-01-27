
<h1 align="center">
  <br>
  <a href="https://useoptic.com"><img src="https://raw.githubusercontent.com/opticdev/optic/master/workspaces/ui/public/optic-logo.svg" alt="Optic" width="200"></a>
  <br>

<h2 align="center">Optic documents and tests your APIs as you build them</h4>


![Build Status](https://img.shields.io/github/workflow/status/opticdev/optic/Release)
![issues](https://img.shields.io/github/issues/opticdev/optic)
![rust](https://img.shields.io/badge/rust-v1.49+-blue.svg)
![closedprs](https://img.shields.io/github/issues-pr-closed-raw/opticdev/optic)
![currentversion](https://img.shields.io/npm/v/@useoptic/cli)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![stars](https://img.shields.io/github/stars/opticdev/optic?style=social)

</h1>

<p align="center">
    <a href="#how-it-works">How it Works</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#documentation-httpsuseopticcomdocs">Documentation</a> •
  <a href="#license">License</a>
</p>


# How it Works

> Optic is like Git, but for your APIs
- Optic documents your APIs as you build them by observing development traffic and learning your API's behavior
- Optic detects API changes by diffing traffic against the current specification
- Provides an accurate API changelog during Code Review
by making your Pull Requests display both API and code changes

### Add Optic to your API
> Similar to `git init`

Install Optic and run `api init`

```bash
yarn add global @useoptic/cli
# Navigate to your API project directory
api init
```

![The api start command initializing](https://www.useoptic.com/static/init-9a9c43677e29e2b6f9f04bd7ce81ec26.svg)

Setup aliases in `optic.yml` for the commands your team runs when building the API

`npm start` -> `api start`

`newman run mycollection.json` -> `postman-tests`


``` yaml
name: My API
tasks:
  start:
    command: npm start
    inboundUrl: http://localhost:4000
  postman-tests:
    command: newman run mycollection.json
    usesTask: http://localhost:4000
```

**How does Optic monitor local traffic?** Optic observes API and diffs API traffic in the background when you're building your API. Whenever you start your API or run tests using Optic's CLI, it will observe your traffic and surface API diffs.



### Develop your API with Optic watching


```bash
api start
[optic] Starting My API API on Port: 3005, with npm run server-start
```



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
[![All Contributors](https://img.shields.io/badge/all_contributors-17-orange.svg?style=flat-square)](#contributors-)
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
    <td align="center"><a href="http://ross-nordstrom.github.io/"><img src="https://avatars0.githubusercontent.com/u/3299155?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ross Nordstrom</b></sub></a><br /><a href="#design-ross-nordstrom" title="Design">🎨</a> <a href="https://github.com/opticdev/Optic/commits?author=ross-nordstrom" title="Code">💻</a> <a href="https://github.com/opticdev/Optic/issues?q=author%3Aross-nordstrom" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://kinlane.com/"><img src="https://avatars2.githubusercontent.com/u/56100?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kin Lane</b></sub></a><br /><a href="#ideas-kinlane" title="Ideas, Planning, & Feedback">🤔</a> <a href="#content-kinlane" title="Content">🖋</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://viljami.io/"><img src="https://avatars3.githubusercontent.com/u/6105650?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Viljami Kuosmanen</b></sub></a><br /><a href="#ideas-anttiviljami" title="Ideas, Planning, & Feedback">🤔</a> <a href="#content-anttiviljami" title="Content">🖋</a></td>
    <td align="center"><a href="http://rcrowley.org/"><img src="https://avatars0.githubusercontent.com/u/11151?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Richard Crowley</b></sub></a><br /><a href="#research-rcrowley" title="Research">🔬</a> <a href="#ideas-rcrowley" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/danMateer"><img src="https://avatars2.githubusercontent.com/u/34169713?v=4?s=100" width="100px;" alt=""/><br /><sub><b>dnmtr</b></sub></a><br /><a href="https://github.com/opticdev/Optic/pulls?q=is%3Apr+reviewed-by%3AdanMateer" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
