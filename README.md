![GitHub Repo stars](https://img.shields.io/github/stars/opticdev/optic?style=social) ![GitHub contributors](https://img.shields.io/github/contributors-anon/opticdev/optic?style=social) ![npm](https://img.shields.io/npm/dm/@useoptic/openapi-io?style=social)

# Optic helps you ship a great API

**Shipping an API is easy** -- the REST is hard. We built Optic because every developer/team should be able to get the benefits of OpenAPI, without all the time/effort/costs. 

[**📋 Documentation for all your APIs**](#document-your-existing-apis-in-minutes)    ← *write your API promises down*

[**🛑 Prevent breaking changes from shipping**](#prevent-breaking-changes-with-api-diffs)  ← *keep your promises*

[**✅ Verify your API is working-as-designed (the OpenAPI and implimentation are in sync)**](#verify-your-api-is-working-as-designed)    ← *make sure the API works as-designed*

[**🎨 Build a consistent API that follows your team's standards**](#build-a-consistent-api-that-follows-your-teams-standards)  ← *raise the quality of your API*

```bash
npm install -g @useoptic/optic
```

## Document your existing APIs in minutes 
Use real API traffic to write your initial OpenAPI specification and correctly patch the spec whenever an API changes. 

1. Use the CLI to magicly capture traffic `optic oas capture https://api.github.com` OR provide a HAR (HTTP Archive format). 
2. Then run `optic oas verify` to see a list of "Undocumented" endpoints. Optic is your API version control tool, like git for APIs. "Undocumented" endpoints are "Untracked" files in git. 
3. Add operations one at a time or pass `--document all`

**[Documentation: Generate an OpenAPI from traffic](https://www.useoptic.com/docs/document-existing-api)**


https://user-images.githubusercontent.com/5900338/210244068-22540288-1f6d-46a7-a2e9-5b3d19a00f31.mp4

**[Read Documentation](https://www.useoptic.com/docs/document-existing-api)**

## Prevent breaking changes with API diffs

Breaking changes ruin your API consumer's days. Optic prevents breaking changes from reaching production with `diff` -- an accurate and robust OpenAPI diff tool that is built to work within Git workflows, and has full support for OpenAPI 3.0 3.1 and `$ref`, and complex types like `oneOf/allOf/anyOf`. 

```bash
optic diff openapi.yaml --base main --check
```

**[Documentation: Diff OpenAPI and Catch Breaking Changes](https://www.useoptic.com/docs/diff-openapi)**

https://user-images.githubusercontent.com/5900338/211033179-86d5021f-17d1-4391-afc9-77689aa5882f.mp4

**[Read Documentation](https://www.useoptic.com/docs/diff-openapi)**

## Verify your API is working-as-designed

With Optic you can verify the API behavior in CI and understand your API Test Coverage (the % of your API functionality your testing covered). If optic oas verify detects no diffs, and you have high coverage, you can be very confident your API is working as-designed.

```bash
optic oas verify openapi.yml
```

**[Documentation: Verify your API is working as-designed](https://www.useoptic.com/verify-api-behaviors)**

https://user-images.githubusercontent.com/5900338/211056700-00163967-12fd-447a-a108-f82bc9c9f0ad.mp4

**[Read Documentation](https://www.useoptic.com/verify-api-behaviors)**

## Build a consistent API that follows your team's standards
Optic makes it easy for everyone on your team to review API changes, and automate your API standards. It makes API linting usable and productive for developers on teams like [Snyk](https://snyk.io/blog/snyk-api-development-shift-left/) because it raises the quality of their APIs without getting in the way of developers. 

You can read about how Optic goes [beyond simple API Linting](https://www.useoptic.com/blog/beyond-api-linting). 

```
ruleset:
  - breaking-changes
  - spectral:
      onAdded:
        - ./rest-standards.spectral.yml
      always: 
        - ./metadata-standards.spectral.yml
        - ./openapi-is-valid.spectral.yml
  - naming:
      applies: added
      pathComponents: camelCase
      requestHeaders: Capital-Param-Case
      queryParameters: Capital-Param-Case
```

https://user-images.githubusercontent.com/5900338/211058178-6c3c7f76-55be-4e7a-81f0-3aec07253518.mp4

**[Read Documentation](https://www.useoptic.com/docs/api-standards)**


--- 

## Community & Support
- If you run into bugs, please open [Issues](https://github.com/opticdev/optic/issues). 
- [Discord](https://github.com/opticdev/optic/issues)
- Anyone is welcome to [book office hours](https://calendly.com/optic-onboarding/optic-office-hours) for support or to talk about contributing. 

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
