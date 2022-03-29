
> **Announcement:** Optic is launching with native support for OpenAPI 3. [Read more and get early access here ](https://www.useoptic.com/blog/optic-for-openapi)

---

# Track and review API changes as a team
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/44b771b178c0e6848c3064f8684f299080b20e72fbb2d2191ea42e1d099ef9cf/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f776f726b666c6f772f7374617475732f6f707469636465762f6f707469632f52656c65617365"><img src="https://camo.githubusercontent.com/44b771b178c0e6848c3064f8684f299080b20e72fbb2d2191ea42e1d099ef9cf/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f776f726b666c6f772f7374617475732f6f707469636465762f6f707469632f52656c65617365" alt="Build Status" data-canonical-src="https://img.shields.io/github/workflow/status/opticdev/optic/Release" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/f66a8db5ca0ca0e9218434e4a00b1bb17e2c06310f6782a402181b78b45b862d/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732f6f707469636465762f6f70746963"><img src="https://camo.githubusercontent.com/f66a8db5ca0ca0e9218434e4a00b1bb17e2c06310f6782a402181b78b45b862d/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732f6f707469636465762f6f70746963" alt="issues" data-canonical-src="https://img.shields.io/github/issues/opticdev/optic" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/cf6c3e2c15e5eaa40af4a89b6c54d5c38e7fda513826e0edf966064702e26e9d/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f727573742d76312e34392b2d626c75652e737667"><img src="https://camo.githubusercontent.com/cf6c3e2c15e5eaa40af4a89b6c54d5c38e7fda513826e0edf966064702e26e9d/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f727573742d76312e34392b2d626c75652e737667" alt="rust" data-canonical-src="https://img.shields.io/badge/rust-v1.49+-blue.svg" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/13fefb2454d8ce93fe5956fabc5c01f5676712228a360d408e722edfc262218c/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732d70722d636c6f7365642d7261772f6f707469636465762f6f70746963"><img src="https://camo.githubusercontent.com/13fefb2454d8ce93fe5956fabc5c01f5676712228a360d408e722edfc262218c/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f6973737565732d70722d636c6f7365642d7261772f6f707469636465762f6f70746963" alt="closedprs" data-canonical-src="https://img.shields.io/github/issues-pr-closed-raw/opticdev/optic" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/2854008ab57f0339342647269cd54c0b626494ea523c7a92c015e375fdcf42e5/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f407573656f707469632f636c69"><img src="https://camo.githubusercontent.com/2854008ab57f0339342647269cd54c0b626494ea523c7a92c015e375fdcf42e5/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f407573656f707469632f636c69" alt="currentversion" data-canonical-src="https://img.shields.io/npm/v/@useoptic/cli" style="max-width:100%;"></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://camo.githubusercontent.com/83d3746e5881c1867665223424263d8e604df233d0a11aae0813e0414d433943/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6c6963656e73652d4d49542d626c75652e737667" alt="License" data-canonical-src="https://img.shields.io/badge/license-MIT-blue.svg" style="max-width:100%;"></a>
<a target="_blank" rel="noopener noreferrer" href="https://camo.githubusercontent.com/80740ef555feafeb5b1d3da8a726bb549f12e2994c7077042a406d036de8500a/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f6f707469636465762f6f707469633f7374796c653d736f6369616c"><img src="https://camo.githubusercontent.com/80740ef555feafeb5b1d3da8a726bb549f12e2994c7077042a406d036de8500a/68747470733a2f2f696d672e736869656c64732e696f2f6769746875622f73746172732f6f707469636465762f6f707469633f7374796c653d736f6369616c" alt="stars" data-canonical-src="https://img.shields.io/github/stars/opticdev/optic?style=social" style="max-width:100%;"></a>
<br/>

Design better APIs · Improve quality · Ship faster. It starts with having the right conversations on your team

### In this repo are the open source libraries powering Optic

- `optic-ci` - the tool used to compare specs and enforce your rules for your API
- `rulesets-base` - includes the SDKs for authoring and running your own `optic-ci` checks

## Migrating from Optic 10 to Optic 11

Optic 11 is in beta and nearing release. [Get early access by joining the beta here](https://www.useoptic.com/). If you are using Optic `<=10`, the first step is to migrate your spec to an OpenAPI file.

### Generating an OpenAPI specification

In your project's root directory, run `api generate:oas`. This exports your specification into an OpenAPI file for the Optic Toolkit, in YAML format. Copy the file in the command output into your project's root folder as `optic.openapi.yaml`.

```bash
$ api generate:oas

[optic] Generated OAS files
[optic] /{project root}/.optic/generated/openapi.yaml

$ cp .optic/generated/openapi.yaml optic.openapi.yaml
$ git add optic.openapi.yaml
```

💡 **Optional** You may specify a JSON OpenAPI file with the `--json` flag and using the `.json` extension. You may also save your OpenAPI file anywhere in your project, just don't lose track of it.

### Cleaning up

You're ready to run the Optic Toolkit against your project. It will automatically use the OpenAPI file exported above, and update it when changes are detected. Once you're comfortable with the new toolkit, you can remove the Optic 10 files from your project with `rm -rf .optic optic.yml`. It's safe to remove these files: the only thing the new Optic Toolkit uses is your OpenAPI specification.

You should also remove the old Optic 10 CLI, as it doesn't share any components with the Optic Toolkit and is no longer necessary. Removal depends on how you installed it in the first place. For example, to uninstall via NPM, `npm remove --global @useoptic/cli`.

 If you have any problem or questions Open an Issue or reach out in [Discord](https://discord.useoptic.com).

## Resources
- Read our about Aidan + Dev's vision for the space **[Read: Git for APIs](https://optic10.useoptic.com/blog/git-for-apis)**
- Listen to **[Optic on Software Engineering Daily](https://softwareengineeringdaily.com/2020/09/02/api-change-management-with-aidan-cunniffe/)**
- Read API Evangelist on Optic **[Automatically Generate OpenAPI For Your APIs Just By Using Them
  ](https://apievangelist.com/2019/12/12/automatically-generate-openapi-for-your-apis-just-by-using-them/)**

- **[Join Community](https://optic10.useoptic.com/docs/community)**

Want to help us design the next features? [Book Maintainer Office Hours](https://calendly.com/opticlabs/maintainer-office-hours?month=2021-01)

## License
MIT

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-34-orange.svg?style=flat-square)](#contributors-)
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
  <tr>
    <td align="center"><a href="https://baptiste.darthenay.fr/"><img src="https://avatars.githubusercontent.com/u/2727048?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Baptiste Darthenay</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=batisteo" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/alexlmiller"><img src="https://avatars.githubusercontent.com/u/5964662?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alex Miller</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=alexlmiller" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/jshearer"><img src="https://avatars.githubusercontent.com/u/4368270?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Joseph Shearer</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=jshearer" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/raybejjani"><img src="https://avatars.githubusercontent.com/u/744312?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ray Bejjani</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=raybejjani" title="Documentation">📖</a></td>
    <td align="center"><a href="https://twitter.com/adrienbrault"><img src="https://avatars.githubusercontent.com/u/611271?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adrien Brault</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=adrienbrault" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/niclim"><img src="https://avatars.githubusercontent.com/u/18374483?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nicholas Lim</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=niclim" title="Documentation">📖</a> <a href="https://github.com/opticdev/Optic/commits?author=niclim" title="Code">💻</a></td>
    <td align="center"><a href="http://smizell.com/"><img src="https://avatars.githubusercontent.com/u/130959?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Stephen Mizell</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=smizell" title="Code">💻</a> <a href="https://github.com/opticdev/Optic/commits?author=smizell" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/bojan88"><img src="https://avatars.githubusercontent.com/u/1783133?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bojan Đurđević</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=bojan88" title="Code">💻</a></td>
    <td align="center"><a href="http://twitter.com/tarasm"><img src="https://avatars.githubusercontent.com/u/74687?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Taras Mankovski</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=taras" title="Documentation">📖</a></td>
    <td align="center"><a href="https://bandism.net/"><img src="https://avatars.githubusercontent.com/u/22633385?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ikko Ashimine</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=eltociear" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/silentninja"><img src="https://avatars.githubusercontent.com/u/4469754?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mukesh</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=silentninja" title="Code">💻</a></td>
    <td align="center"><a href="http://www.aquicore.com/"><img src="https://avatars.githubusercontent.com/u/14347319?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tony Knight</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=tony-aq" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/rogerd330"><img src="https://avatars.githubusercontent.com/u/1417037?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Roger Dickey, Jr</b></sub></a><br /><a href="https://github.com/opticdev/Optic/commits?author=rogerd330" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
