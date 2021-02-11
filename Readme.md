
<img src="https://raw.githubusercontent.com/opticdev/optic/develop/website/static/img/optic-svg.svg" alt="Optic">

# Optic uses real traffic to document and test your APIs
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/44b771b178c0e6848c3064f8684f299080b20e72fbb2d2191ea42e1d099ef9cf/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f776f726b666c6f772f7374617475732f6f707469636465762f6f707469632f52656c65617365"><img src="https://camo.githubusercontent.com/44b771b178c0e6848c3064f8684f299080b20e72fbb2d2191ea42e1d099ef9cf/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f776f726b666c6f772f7374617475732f6f707469636465762f6f707469632f52656c65617365" alt="Build Status" data-canonical-src="https://img.shields.io/github/workflow/status/opticdev/optic/Release" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/f66a8db5ca0ca0e9218434e4a00b1bb17e2c06310f6782a402181b78b45b862d/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732f6f707469636465762f6f70746963"><img src="https://camo.githubusercontent.com/f66a8db5ca0ca0e9218434e4a00b1bb17e2c06310f6782a402181b78b45b862d/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732f6f707469636465762f6f70746963" alt="issues" data-canonical-src="https://img.shields.io/github/issues/opticdev/optic" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/cf6c3e2c15e5eaa40af4a89b6c54d5c38e7fda513826e0edf966064702e26e9d/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f727573742d76312e34392b2d626c75652e737667"><img src="https://camo.githubusercontent.com/cf6c3e2c15e5eaa40af4a89b6c54d5c38e7fda513826e0edf966064702e26e9d/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f727573742d76312e34392b2d626c75652e737667" alt="rust" data-canonical-src="https://img.shields.io/badge/rust-v1.49+-blue.svg" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/13fefb2454d8ce93fe5956fabc5c01f5676712228a360d408e722edfc262218c/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732d70722d636c6f7365642d7261772f6f707469636465762f6f70746963"><img src="https://camo.githubusercontent.com/13fefb2454d8ce93fe5956fabc5c01f5676712228a360d408e722edfc262218c/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732d70722d636c6f7365642d7261772f6f707469636465762f6f70746963" alt="closedprs" data-canonical-src="https://img.shields.io/github/issues-pr-closed-raw/opticdev/optic" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/2854008ab57f0339342647269cd54c0b626494ea523c7a92c015e375fdcf42e5/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f407573656f707469632f636c69"><img src="https://camo.githubusercontent.com/2854008ab57f0339342647269cd54c0b626494ea523c7a92c015e375fdcf42e5/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f407573656f707469632f636c69" alt="currentversion" data-canonical-src="https://img.shields.io/npm/v/@useoptic/cli" style="max-width:100%;"></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://camo.githubusercontent.com/83d3746e5881c1867665223424263d8e604df233d0a11aae0813e0414d433943/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6c6963656e73652d4d49542d626c75652e737667" alt="License" data-canonical-src="https://img.shields.io/badge/license-MIT-blue.svg" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/80740ef555feafeb5b1d3da8a726bb549f12e2994c7077042a406d036de8500a/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f6f707469636465762f6f707469633f7374796c653d736f6369616c"><img src="https://camo.githubusercontent.com/80740ef555feafeb5b1d3da8a726bb549f12e2994c7077042a406d036de8500a/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f6f707469636465762f6f707469633f7374796c653d736f6369616c" alt="stars" data-canonical-src="https://img.shields.io/github/stars/opticdev/optic?style=social" style="max-width:100%;"></a>
<br/>

- Language agnostic, works with any Rest API
- Optic observes development traffic and learns your API's behavior
- Optic detects API changes by diffing traffic against the current specification
- Optic adds an accurate API changelog to every Pull Request


<p>
  <a href="#try-optic">Try Optic</a> •
  <a href="#document-your-api-using-real-traffic">Document APIs</a> •
  <a href="#detect-api-changes">Detect Changes</a> •
  <a href="#an-api-changelog-in-every-pr">Optic GitBot</a> •
  <a href="#contributors-">Contributing</a>
  <a href="#license">License</a>
</p>

## [Click here for a Live Demo](https://useoptic.com/docs/demo)

## Try Optic
> Similar to `git init`

Install Optic with npm or yarn"

```bash
yarn add global @useoptic/cli
npm install @useoptic/cli -g
```
Then run init command:
```
## Navigate to your API project directory
api init
```
Set up aliases for the commands your team runs when building the API in `optic.yml`

ie `npm start` -> `api start`

ie `newman run mycollection.json` -> `api run postman-tests`

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

**How does Optic monitor local traffic?** Whenever you start your API or run tests using Optic's CLI, it will observe your traffic and surface API diffs. All of this processing is done locally, in the background, by a Rust binary built from the open source code in this repository.

## Document your API using real traffic
> Similar to `git add`

Once you add Optic to your API, hit it with some traffic, and document your first endpoints.

You just have to provide Optic with your API paths, and it will document every status code, response body, and request body automatically based on its observations.

You don't have to worry about hitting every possible request/response your first go -- Optic isn't "one-shot", it builds your spec up incrementally as it makes more observations about your API's behavior. For example, if Optic sees a `200` for an endpoint, and later sees a `400` for the same endpoint, it will help you add the new response.

```bash
api start
[optic] Starting My API API on Port: 3005, with npm run server-start
```

- [Document your API with Optic](https://useoptic.com/docs/using/baseline)
- [Video: Quinn Slack from Sourcegraph documenting GitHub's API in 10 minutes](https://www.youtube.com/watch?v=UQ4TYUvTrok&t=2s)


![The api documentation](https://github.com/opticdev/optic/raw/develop/website/static/img/document-your-api.png)


## Detect API Changes
> Similar to `git status`

While you develop your API and run tests locally, Optic diffs the traffic to find new endpoints, or changes to existing endpoints. These API diffs are listed when you run `api status`:

- [Learn more about detecting + reviewing API Diffs](https://useoptic.com/docs/using/reviewing-diffs)

<img src="https://github.com/opticdev/optic/raw/develop/website/static/img/status.svg" alt="Optic" height="350">


## Use the Optic UI to Review Diffs + Update your Specification

> Similar to staging changes

When Optic detects an API diff, it helps you:
- Document new endpoints without writing a bunch of OpenAPI
- Update your API specification with a few clicks
- Detect any unplanned changes, breaks and regressions, then fix them

![bigdiff](https://github.com/opticdev/optic/raw/develop/website/static/img/big-diff.png)

## An API Changelog in Every PR
> Similar to GitHub's compare page, but for API changes

The Optic GitBot adds an API Changelog during Code Review, so your team understands how the API will change when each PR is merged.

**🚦 Prevent Breaking Changes**

Discover breaking changes before they're merged. Request compatible changes in code review, or coordinate the breaking changes with consumers.

**🔎 API First**

Adding explicit API changelogs in PRs facilitates discussion and leads to better API design. It's also a great way to make sure unintended API changes don't get deployed.

**✅ Updated Docs**

No more doc drift. When you approve an API change Optic also updates the specification.

[Install & Set up the GitBot](https://useoptic.com/docs/apiops/pull-requests)

![changelog](https://github.com/opticdev/optic/raw/develop/website/static/img/gitbot-large.png)

---

## Documentation [https://useoptic.com/docs](https://www.useoptic.com/docs)

- Read the full docs at: [useoptic.com/docs](https://www.useoptic.com/docs).
- Want to contribute? Check out the [Contribution Guidelines](Contributing.md).
- To get set up working on the project, please review our [Developer Setup](Developer-setup.md) guide as well.


## Resources
- Read our about Aidan + Dev's vision for the space **[Read: Git for APIs](https://useoptic.com/blog/git-for-apis)**
- Listen to **[Optic on Software Engineering Daily](https://softwareengineeringdaily.com/2020/09/02/api-change-management-with-aidan-cunniffe/)**
- Read API Evangelist on Optic **[Automatically Generate OpenAPI For Your APIs Just By Using Them
  ](https://apievangelist.com/2019/12/12/automatically-generate-openapi-for-your-apis-just-by-using-them/)**

- **[Join Community](https://useoptic.com/docs/community)**
- **[Book Maintainer Office Hours](https://calendly.com/opticlabs/maintainer-office-hours?month=2021-01)**

Want to help us design the next features? [Book Maintainer Office Hours](https://calendly.com/opticlabs/maintainer-office-hours?month=2021-01)

## License
MIT

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-21-orange.svg?style=flat-square)](#contributors-)
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
    <td align="center"><a href="https://tim.fyi/"><img src="https://avatars.githubusercontent.com/u/1526883?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tim Perry</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=pimterry" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jordaniza"><img src="https://avatars.githubusercontent.com/u/45881807?v=4?s=100" width="100px;" alt=""/><br /><sub><b>jordaniza</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=jordaniza" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/svanderbleek"><img src="https://avatars.githubusercontent.com/u/491969?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sandy Vanderbleek</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=svanderbleek" title="Documentation">📖</a></td>
    <td align="center"><a href="http://blog.urth.org/"><img src="https://avatars.githubusercontent.com/u/50729?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dave Rolsky</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=autarch" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
