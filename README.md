# Optic

Optic helps you ship a better API by making OpenAPI easy to use. Prevent breaking changes, publish accurate documentation and improve your the design of your API.

**Install**
```bash
npm install -g @useoptic/optic
```
 
![GitHub Repo stars](https://img.shields.io/github/stars/opticdev/optic?style=social) ![GitHub contributors](https://img.shields.io/github/contributors-anon/opticdev/optic?style=social) ![npm](https://img.shields.io/npm/dm/@useoptic/openapi-io?style=social) ![license](https://img.shields.io/github/license/opticdev/optic?style=social)
---

## Start locally

### Prevent breaking changes using `optic diff`

Optic can detect breaking changes between any two versions of an OpenAPI specification. Reference the versions using Git tags and branch names:

**Compares the HEAD to the `main` branch**
```
optic diff openapi.yml --base main --check
```
**Compares two branches by name**
```
optic diff feature/example:openapi.yml develop:main --check
```

<img src="https://github.com/opticdev/optic/assets/5900338/fd6cdd7f-c147-467b-9517-84232baa898f" width="500" />

## Test the accuracy of your documentation using `optic verify`
It can be difficult to keep an OpenAPI in-sync with your implementation. Optic tests if your OpenAPI is accurate by capturing traffic from your tests and comparing it to the spec.

Think of it like Snapshot testing, but for your API's behavior, with OpenAPI as the snapshot. 

```
optic capture openapi.yml https://localhost:8080 --command "npm test"
optic verify openapi.yml
```

<img src="https://github.com/opticdev/optic/assets/5900338/fd6cdd7f-c147-467b-9517-84232baa898f" width="500" />

When Optic detects a diff, you can correct it manually, or run `optic update` to have Optic figures out exactly which lines of OpenAPI need to be updated and make the changes for you.

<img src="https://github.com/opticdev/optic/assets/5900338/fd6cdd7f-c147-467b-9517-84232baa898f" width="500" />

## Improve your API design with `optic lint` & `optic diff`
Optic is the first API linter built with the API lifecycle in-mind. When testing your API design, it always considers two versions of your API, for example: the version on the `develop` vs the `latest` release tag. This lets Optic check for all kinds of things [Spectral (and other liners) misses](https://www.useoptic.com/comparisons/spectral) like breaking changes and proper use of your API versioning scheme.

Because Optic understands API change, it can apply your latest API standards to new API endpoints, and a looser set of standards to legacy endpoints that can’t change. [Teams like Snyk use Optic and this approach to govern all their APIs](https://snyk.io/blog/snyk-api-development-shift-left/). With Optic, developers only get actionable feedback from the tool and they don’t have to turn rules off to get CI to pass.

Create an `optic.yml` file in your repo and configure some of our built-in rules like using this template as a starting point:
```yaml
ruleset:
  # Prevent breaking changes
  - breaking-changes:
      # Pick an extension for your work-in-progress operations.
      # Breaking changes wil lbe allowed here
      exclude_operations_with_extension: x-draft
  # Run any existing spectral ruleset
  - spectral:
      # These rules will ony run on things you add to your API
      # Ie new properties, operations, responses, etc.
      added:
        # URLs are supported
        - https://www.apistyleguides.dev/api/url-style-guides/3ba0b4a
        # Local files work too.
      # - ./local-file.js
      # These rules will ony run on everything in the spec (normal spectral)
      always:
        - https://www.apistyleguides.dev/api/url-style-guides/3ba0b4a
  # Enforce consistent cases in your API
  - naming:
      # This will apply the rule to only new names (existing ones will be exempted)
      # Change to always if you want to fail on legacy names
      # Change to addedOrChanged if you want it to run on added or changed parts of the spec
      required_on: added
      # Different names for different parts of the spec
      # options = "snake_case" "camelCase" "Capital-Param-Case" "param-case" "PascalCase"
      requestHeaders: Capital-Param-Case
      responseHeaders: param-case
      properties: Capital-Param-Case
      pathComponents:  param-case
      queryParameters: snake_case
  # Require your OpenAPI has examples, and that those examples match the schema
  - examples:
      # Turn on/off the parts of the spec that need examples
      require_request_examples: true
      require_response_examples: true
      require_parameter_examples: true
      # (optional) allow certain operations do not need examples
      exclude_operations_with_extension: x-legacy-api

```

<img src="https://github.com/opticdev/optic/assets/5900338/fd6cdd7f-c147-467b-9517-84232baa898f" width="500" />


---

## [Read our full documentation here](https://www.useoptic.com/docs)
## [Need help? Book office hours](https://calendly.com/optic-onboarding/optic-office-hours)

### License
Optic is MIT Licensed 

### Telemetry
Optic collects telemetry which is used to help understand how to improve the product. For example, this usage data helps to debug issues and to prioritize features and improvements based on usage. The usage of our telemetry data falls under our [privacy policy](https://www.useoptic.com/privacy-policy). While this information does help us build a great product, we understand that not everyone wants to share their usage data. If you would like to disable telemetry you can add an environment variable that will opt out of sending usage data:

`OPTIC_TELEMETRY_LEVEL=off` - disables telemetry (both usage, and error reporting)
`OPTIC_TELEMETRY_LEVEL=error` - disables telemetry (only usage data is sent)
