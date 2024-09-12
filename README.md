 
![GitHub Repo stars](https://img.shields.io/github/stars/opticdev/optic?style=social) ![GitHub contributors](https://img.shields.io/github/contributors-anon/opticdev/optic?style=social) ![npm](https://img.shields.io/npm/dm/@useoptic/openapi-io?style=social) ![license](https://img.shields.io/github/license/opticdev/optic?style=social)

# Optic - the CI tool that improves your APIs
Optic helps you ship a better API by making it easy for teams to use OpenAPI. Prevent breaking changes, publish accurate documentation and improve the design of your APIs.

![Screenshot 2023-06-14 at 12 55 11 PM](https://github.com/opticdev/optic/assets/5900338/a446bac2-06b6-40bd-a7d4-42f1cc3621ea)


**Install**
```bash
npm install -g @useoptic/optic
```
or
```bash
sh -c "$(curl -Ls https://install.useoptic.com/install.sh)"
```

---

## Run locally

### Prevent breaking changes using `optic diff`

Optic can detect breaking changes between any two versions of an OpenAPI specification. Optic can lookup the versions using Git tags and branch names so you don't need to copy files around.

**Compares the HEAD to the `main` branch**
```
optic diff openapi.yml --base main --check
```
**Compares two branches by name**
```
optic diff feature/example:openapi.yml develop:main --check
```
**Compare files in against a remote URL**
```
optic diff --check \
https://raw.githubusercontent.com/opticdev/bookstore-example/89c9a67935c850c1051059f4c719ef433dea8cc0/openapi.yml \
https://raw.githubusercontent.com/opticdev/bookstore-example/ac5f3c55a6f7f27c482a557563686d0328dafb55/openapi.yml
```

<img src="https://github.com/opticdev/optic/assets/5900338/fd6cdd7f-c147-467b-9517-84232baa898f" width="500" />

[Read Documentation](https://www.useoptic.com/docs/diff-openapi)

## Test the accuracy of your documentation using `optic capture`
It can be difficult to keep an OpenAPI in-sync with your implementation. Optic tests if your OpenAPI is accurate by capturing traffic from your tests and comparing it to the spec.

Think of it like Snapshot testing, but for your API's behavior, with OpenAPI as the snapshot.

<details>
  <summary>Try it out with our example repo</summary>
  You can clone our example repo to try out `optic capture` against a repo that is already set up.

  ```bash
  git clone git@github.com:opticdev/examples.git
  cd ./examples/apps/bookstore-api
  npm install
  ```

  Once you've set up the repo, you can run `optic capture openapi.yml` to verify traffic against your OpenAPI spec, and `optic capture openapi.yml --update=interactive` to update any diffs.
</details>

To start capturing your test traffic, run:

```
optic capture init openapi.yml
```

Configuration will be generated for you in the `optic.yml` file

```yml
capture:
  openapi.yml:
    server:
      command: npm start # your server start command
      url: http://localhost:8080 # where your server starts
    requests:
      send:
        - path: /
          method: GET
        - path: /users/create
          method: POST
          headers:
            content-type: application/json;charset=UTF-8
          data:
            name: Hank
```

Then you can run:

```
optic capture openapi.yml
```

<img width="602" alt="Screenshot 2023-09-08 at 2 11 00 PM" src="https://github.com/opticdev/optic/assets/18374483/a4daba2a-3be1-446d-9747-28a1cdce3926">


When Optic detects a diff, you can correct it manually, or run `optic capture --update=interactive` to have Optic figures out exactly which lines of OpenAPI need to be updated and make the changes for you.

```
optic capture openapi.yml --update=interactive
```

<img width="604" alt="Screenshot 2023-09-08 at 2 12 15 PM" src="https://github.com/opticdev/optic/assets/18374483/c7c540c8-2501-4824-aac6-049587e29c0a">


[Read Documentation](https://www.useoptic.com/docs/verify-openapi)

## Improve your API design with `optic diff`
Optic is the first API linter built with the API lifecycle in-mind. When testing your API design, it always considers two versions of your API, for example: the version on the `develop` vs the `latest` release tag. This lets Optic check for all kinds of things [Spectral (and other liners) misses](https://www.useoptic.com/comparisons/spectral) like breaking changes and proper use of your API versioning scheme.


<img src="https://github.com/opticdev/optic/assets/5900338/50a43d09-f531-405b-8b53-1c91ff5b8201" width="500" />


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
      # This will apply the rule to only new names (existing ones will be exempted)
      # Change to always if you want to fail on legacy names
      # Change to addedOrChanged if you want it to run on added or changed parts of the spec
      required_on: added
      # Turn on/off the parts of the spec that need examples
      require_request_examples: true
      require_response_examples: true
      require_parameter_examples: true
      # (optional) allow certain operations do not need examples
      exclude_operations_with_extension: x-legacy-api
  # Require documentation in your OpenAPI spec
  - documentation:
      # This will apply the rule to only new names (existing ones will be exempted)
      # Change to always if you want to fail on legacy names
      # Change to addedOrChanged if you want it to run on added or changed parts of the spec
      required_on: added
      require_property_descriptions: true
      require_operation_summary: true
      require_operation_description: true
      require_operation_id: true
```

[Read documentation](https://www.useoptic.com/docs/style-guides)


## Start running in CI
To start using Optic in CI, [follow this guide](https://www.useoptic.com/docs/setup-ci). We provide template workflows for GitHub and GitLab to help you run Optic as a CI check:

### Github

```yaml 
# .github/workflows/optic.yml
name: optic
on:
  pull_request:
  push:
    branches:
      - "main"

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install Optic
        run: npm install --location global @useoptic/optic

      - name: Run Optic
        env:
          OPTIC_TOKEN: ${{ secrets.OPTIC_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: optic run
```

### Gitlab

Don't forget to add the `OPTIC_TOKEN` and `OPTIC_GITLAB_TOKEN` variables to your workflow.

```yaml
# .gitlab-ci.yml
optic-default-branch-push:
  image: node:latest
  rules:
    - if: $CI_PIPELINE_SOURCE == "push" && OPTIC_TOKEN && $CI_COMMIT_REF_NAME == $CI_DEFAULT_BRANCH
  script:
    - npm install -g @useoptic/optic
    - optic run

optic-merge-request:
  image: node:latest
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event" && $OPTIC_TOKEN
  script:
    - npm install -g @useoptic/optic
    - export OPTIC_RESULT=0; optic run || export OPTIC_RESULT=$?
    - if [ $OPTIC_RESULT -ne 0 ]; then exit 1; fi;
```


<img src="https://github.com/opticdev/optic/assets/5900338/18eb381a-59aa-42af-975a-36d1f24a5978" width="500" />

### License
Optic is MIT Licensed 

### Telemetry
Optic collects telemetry which is used to help understand how to improve the product. For example, this usage data helps to debug issues and to prioritize features and improvements based on usage. The usage of our telemetry data falls under our [privacy policy](https://www.useoptic.com/privacy-policy). While this information does help us build a great product, we understand that not everyone wants to share their usage data. If you would like to disable telemetry you can add an environment variable that will opt out of sending usage data:

`OPTIC_TELEMETRY_LEVEL=off` - disables telemetry (both usage, and error reporting)
`OPTIC_TELEMETRY_LEVEL=error` - disables telemetry (only usage data is sent)
