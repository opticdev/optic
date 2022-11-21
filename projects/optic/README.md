## Optic

### Quick start guide

Install `optic` and `oas`:

```bash
npm i -g @useoptic/optic
```

Initialize an `optic.dev.yml` config file

```bash
optic init
# this will create an optic.dev.yml file 
```

Configure your ruleset, see our [build in rules](../standard-rulesets/README.md) or start building your own [custom rules](../rulesets-base/README.md) by running `optic ruleset init`. 

```yml
ruleset:
  - breaking-changes # built in rulesets
  - naming:
      # pass in configuration to rulesets
      properties: snake_case
      required_on: added
      pathComponents: snake_case
      requestHeaders: snake_case
      queryParameters: snake_case
      responseHeaders: snake_case
      cookieParameters: snake_case
  - '@org/custom-ruleset' # a custom ruleset hosted on Optic cloud
  - ./rules/local.js # path to a built local ruleset js file
```

Run a diff between two OpenAPI files and check results:

```bash
optic diff <path_to_file_1> <path_to_file_2> --check
```

## Analyzing changes between OpenAPI specs

Optic helps you analyze changes in your OpenAPI spec. The diff command can be used to generate a changelog between two specs. By default, Optic checks for breaking changes. There are a few ways you can run the diff command.

Running a diff between two files on your file system

```bash
optic diff specs/openapi-spec-v0.yml specs/openapi-spec-v1.yml
```

Running a diff against a file on the master branch

```bash
optic diff master:specs/openapi-spec.yml specs/openapi-spec.yml

# or

optic diff specs/openapi-spec.yml --base master
```

Running a diff on a file from your `optic.dev.yml`

```bash
# runs a diff against the users-api id
optic diff --id users-api --base master
```

Additional options:

- `--check` turns on breaking change detection against the changed files as specified in your `optic.dev.yml` rulesets config.
- `--web` opens a web page with the changes that ran (recommended for a more UI rich changelog experience).

## Setup Optic in CI

Optic helps you review OpenAPI specs and enforce API standards. Sign up on [app.useoptic.com](https://app.useoptic.com).

### Telemetry

Optic collects telemetry which is used to help understand how to improve the product. For example, this usage data helps to debug issues and to prioritize features and improvements based on usage. The usage of our telemetry data falls under our [privacy policy](https://www.useoptic.com/privacy-policy). While this information does help us build a great product, we understand that not everyone wants to share their usage data. If you would like to disable telemetry you can add an environment variable that will opt out of sending usage data:

- `OPTIC_TELEMETRY_LEVEL=off` - disables telemetry (both usage, and error reporting)
- `OPTIC_TELEMETRY_LEVEL=error` - disables telemetry (only usage data is sent)
