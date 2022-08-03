
![GitHub Repo stars](https://img.shields.io/github/stars/opticdev/optic?style=social)
![GitHub contributors](https://img.shields.io/github/contributors-anon/opticdev/optic?style=social)
![npm](https://img.shields.io/npm/dm/@useoptic/openapi-io?style=social)


# Adopt OpenAPI. Start working API-first.
> Optic's Open Source tools make OpenAPI and API-first practices easy for any team to adopt.
> 


## Installation
```bash
npm install -g @useoptic/optic
```

## Diff OpenAPI specifications

Understand the API changes between two versions of an OpenAPI descriptions. Optic helps teams review proposed API changes:

*diff current branch with base branch* 
```bash
optic diff openapi.yaml --base main
```
*between two OpenAPI files*
```bash
optic diff openapi.yaml openapi-changed.yaml
```

<img src="https://i.imgur.com/hpKgOha.png" width="400" />

[Read diff documentation](https://useoptic.com/docs/openapi-diff)

## Catch breaking changes
API diffs containing breaking changes will be flagged so you do not break consumers. Optic helps you keep your promises.


```bash
optic diff openapi.yaml --base main --check
```

<img src="https://i.imgur.com/JEQL2GV.png" width="400" />

[Read breaking change documentation](https://useoptic.com/docs/breaking-changes)


## Resources

- [Documentation](https://useoptic.com)
- [Beyond API Linting: How Optic is different](https://useoptic.com/blog/beyond-api-linting)
- [Adding Optic to your CI Pipeline](https://useoptic.com/docs/optic-cloud)
- [Book office hours](https://calendly.com/optic-onboarding/optic-office-hours)

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
