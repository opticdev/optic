## Optic CI packaged with standard rules

Install

```bash
npm install -g @useoptic/optic-ci
```

```bash
yarn global add @useoptic/optic-ci
```

### Catch breaking changes between versions:

**Comparing files:**

`optic-ci` always takes two versions of your OpenAPI specification. If you are working in Git you can compare across branches:

```bash
optic-ci compare --from main:openapi.yaml --to feature/xyz:openapi.yaml
```

When you are just trying to learn how `optic-ci` works, make a copy of your OpenAPI file, make a small change, and run compare on both versions:

```bash
optic-ci compare --from openapi-v1.yaml --to openapi-v2.yaml
```

Give it a try! Make a required response property optional, or add a required query parameter! There are many ways to break an API.

### Apply your team's naming checks

`optic-ci` ships with the ability to enforce standard naming rules. Add the rules to your `optic.config.js` to tell Optic about your team's casing strategy. An example of this is:

```js
// optic.config.js
module.exports = {
  checks: [
    { name: 'optic-breaking-changes' }, // on by default
    {
      name: 'optic-named-checks',
      config: {
        requestHeaders: {
          rule: 'snake_case',
          applies: 'always',
        },
        queryParameters: {
          rule: 'snake_case',
          applies: 'always',
        },
        requestProperties: {
          rule: 'snake_case',
          applies: 'always',
        },
        responseProperties: {
          rule: 'snake_case',
          applies: 'always',
        },
        responseHeaders: {
          rule: 'snake_case',
          applies: 'always',
        },
      },
    },
  ],
};
```

Rule options: `camelCase` | `PascalCase` | `snake_case` | `param-case` | `none`.
Applies options: `whenAdded` | `always` | `whenAddedOrChanged`.

Optic understands that if you suddenly turn on naming rules for a legacy API, it will fail on a lot of existing surface area. This is not helpful because changing those names is a breaking change.

We suggest users also set `applyNamingRules: whenAdded` so that these rules only fail if improperly named surface area is added to the API (ie it governs new endpoints, fields, headers, etc but not old ones). If you want it to fail everywhere (not suggested), you can set it to `always`.

Give it a try -- add a name that does not follow the standard!

### Want to write your own rules?

`optic-ci` ships with the ability to write your own custom rules. Add the custom rule definition to your `optic.config.js`. An example of this is:

```js
const createStandardOperationsChecker = require('./optic/standardOperations.js');
// optic.config.js
module.exports = {
  checks: [
    { name: 'optic-breaking-changes' }, // on by default
    {
      name: 'standard-operations',
      type: 'custom',
      checkService: createStandardOperationsChecker(),
    },
  ],
};
```

```js
// optic/standardOperations.js
const { ApiCheckService, check } = require("@useoptic/rulesets-base");
const { expect } = require("chai"); // this can be substituted for other test assertion libraries

const standardOperations = check("require operation summary")
  .implementation(({ operations }) => {
    operations.requirement.must("have a summary", (operation) => {
      if (!operation.summary) expect.fail("must have a summary");
    });
  });

module.exports = () => {
  const operationsChecker = new ApiCheckService();

  operationsChecker.useRulesFrom(standardOperations.runner());

  return operationsChecker;
};
```

### Join the beta!

We're exploring how to make writing OpenAPI, writing optic rules and standardizing APIs easy for everyone - join our beta and let us help you:
- Drive adoption of OpenAPI in your team
- Write custom rules and checks specific to your team's standards

You can join by signing up on our [website](https://www.useoptic.com/).
