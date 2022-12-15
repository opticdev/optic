# Rulesets base

Optic CI lets you write tests that enforce your API standards, and tests about how the API can change (ie breaking change rules, deprecation policy, versioning strategy, etc).

This package contains tools to write your own rules.

```javascript
import {
  Ruleset,
  OperationRule,
  RequestRule,
  ResponseRule,
  ResponseBodyRule,
  SpecificationRule,
} from '@useoptic/ruleset-base';
// or
const {
  Ruleset,
  OperationRule,
  RequestRule,
  ResponseRule,
  ResponseBodyRule,
  SpecificationRule,
} = require('@useoptic/ruleset-base');
```

## Writing your own rules

Each API Standard is expressed as a `Ruleset`. Rulesets match parts of your OpenAPI specification, and apply a set of rules to the matches.

```javascript
const postEndpointsRuleset = new Ruleset({
  name: 'POST operations standards',
  // A link to your API standards (will direct users here when rule fails)
  docsLink: 'https://optic.com/standards/post-operations',
  // The rules only run on post
  matches: (context) => context.operation.method === 'post',
  rules: [
    /* coming next */
  ],
});
```

> 💡 More complex matches are possible. You could check for x-extensions, a certain path pattern, or anything else in the OpenAPI spec that would qualify this ruleset

Adding a rule that requires all our POST operations to require a 201 response

```javascript
const has201StatusCode = new OperationRule({
  name: 'Has 201 status codes',
  docsLink: 'https://optic.com/standards/post-operations#statuscode201',
  rule: (operationAssertions) => {
    // You can use the helper
    operationAssertions.requirement.hasResponses([{statusCode: "201"}]);
    // Or you can write this manually
    operationAssertions.requirement((value) => {
      if (!value.responses.get('201'))) {
        throw new RuleError({
          message: 'Operation did not have response with status code 201',
        });
      }
    });
  },
});
```

Notice a few things

- There are helpers available for many of the rules you may want to write
- We did not provide a matches to this rule. By default it will run on any operations our Ruleset matches. Adding a matches to this rule would further scope it to a specific part of the API spec.

This rule can now be added to the above ruleset

```javascript
const postEndpointsRuleset = new Ruleset({
  name: 'POST operations standards',
  // A link to your API standards (will direct users here when rule fails)
  docsLink: 'https://optic.com/standards/post-operations',
	// The rules only run on post
  matches: (context) => context.operation.method === 'post'
  rules: [
    // This can also be shared across different Rulesets / standards
    has201StatusCode,
  ],
});
```

### Organizing your own Rulesets

When writing Rulesets for your own API Standards:

1. Group your team’s API Standards into several `Rulesets`. By HTTP Method is usually a good place to start
2. Write down the API Standards that apply to every operation, across all the groups from step 1. Usually these are things like required headers, content types, breaking change rules, etc.
3. Write code to define all your the `Rulesets` and the matchers that will qualify them `matches`
4. Start writing Rules, and add them to the `rules` property of the `Rulesets` where they apply.

### Controling where rules run

There are certain kinds of rules you want to run everywhere. Common examples include:

- Naming rules (ie snake_case)
- Breaking change rules
- Rules that help enforce your versioning strategy

By leaving `matches` unspecified, you are saying that these rules should be applied everywhere

```javascript
const namingRuleset = new Ruleset({
  name: 'Consistent Naming Standards',
  // A link to your API standards (will direct users here when rule fails)
  docsLink: 'https://optic.com/standards/naming',
  rules: [
    headersMustBeParamCase,
    queryParametersMustBeParamCase,
    requestBodyPropertiesMustBeSnakeCase,
    //...
  ],
});
```

In other cases, breaking change rules, versioning standards, and deprecation policies are triggered from changes between two versions of OpenAPI specifications. The lifecycle rules that are available are:

- `added`
- `addedOrChanged`
- `changed`
- `removed`

```javascript
const preventResponsePropertyRemovals = new ResponseRule({
  name: 'prevent required response property removals',
  rule: (responseAssertions, context) => {
    // only runs rule on removed properties
    responseAssertions.property.removed((value) => {
      // if the property that was removed is required, throw error
      if (value.required) {
        throw new RuleError({
          message: `Must not remove required response property ${value.name}`,
        });
      }
    });
  },
});
```

### Assertion helpers

Often, there are common cases you might want to write rules for, such as "operation has query parameter" or "response body has a certain shape". Optic includes helpers to write these assertions more easily.

Examples for

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    // On operation change, checks whether the operation has a request(s) with content type
    operationAssertions.changed.hasRequests([
      { contentType: 'application/json' },
    ]);

    // On operation added, checks whether the operation has a response(s) with content type + status code
    operationAssertions.added.hasResponses([
      { statusCode: '200' }, // This checks for just the status code
      { statusCode: '400', contentType: 'application/json' }, // This expects a status code _with_ content-type
    ]);

    // Looks for a parameter that matches the shape specified
    // matches against the raw value from the OpenAPI specification
    operationAssertions.requirement.hasHeaderParameterMatching({
      name: 'X-Authorization',
    });
    operationAssertions.requirement.hasQueryParameterMatching({
      description: Matchers.string, // Looks for a description that has a string
    });
    operationAssertions.requirement.hasPathParameterMatching({
      description: Matchers.string,
      name: 'userId'
    });
  },
});
```

Request helpers

```javascript
new RequestRule({
  ...,
  rule: (requestAssertions) => {
    // Expects a partial match that the request is an object with an id: string
    requestAssertions.body.added.matches({
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
      },
    });
  },
});
```

Response helpers

```javascript
const ruleRunner = new RuleRunner([
  new ResponseRule({
    ...,
    rule: (responseAssertions) => {
      // Matches a response header with name `X-Application' with a description type string
      responseAssertions.requirement.hasResponseHeaderMatching('X-Application', {
        description: Matchers.string,
      });
    },
  }),
]);

new ResponseBodyRule({
  ...,
  rule: (responseBodyAssertions) => {
    // Expects a partial match that the response body is an object with an id: string
    responseBodyAssertions.body.added.matches({
      schema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
      },
    });
  },
});
```

## Examples

[Breaking Changes](../standard-rulesets/src/breaking-changes/) and [Naming rules](../standard-rulesets/src/naming-changes/) are examples of rulesets implemented using rulesets-base.

## Testing rulesets

rulesets-base also includes a few testing helpers for writing your own tests.

```javascript
import { TestHelpers } from '@useoptic/rulesets-base';
// or
const { TestHelpers } = require('@useoptic/rulesets-base')

...
const RuleToTest = new OperationRule(...);

test('test that my rule works', async () => {
  // Create some mocked data
  const beforeApiSpec = {
    ...TestHelpers.createEmptySpec(),
    paths: {
      '/api/users': {
        get: {
          responses: {}
        }
      }
    }
  };
    const afterApiSpec = {
    ...TestHelpers.createEmptySpec(),
    paths: {
      '/api/users': {
        get: {
          responses: {}
        }
      }
    }
  };
  const ruleResults = await TestHelpers.runRulesWithInputs(
    [RuleToTest],
    beforeApiSpec,
    afterApiSpec
  );
  // You can use your own test library
  // e.g. with jest
  expect(ruleResults).toMatchSnapshot();
})
```

## Connecting Spectral to Optic

> ℹ️ If you just want to use the basic Spectral OAS rulesets, take a look at our [spectral-oas-v6 standard ruleset](../standard-rulesets/README.md#spectral)

With Optic, you can connect your Spectral rules and extend them using Optic's lifecycle (added, changed, addedOrChanged, always) and exemption features.

To start:

```bash
# Create a new custom repo
optic ruleset init spectral-rules
cd ./spectral-rules
npm install

# install the spectral packages
npm i @stoplight/spectral-core

# install spectral rulesets / custom rulesets to configure
npm i @stoplight/spectral-rulesets # or your own custom spectral ruleset
```

Then in the `src/main.ts` file you can connect up Spectral to Optic.

```typescript
import { SpectralRule } from '@useoptic/rulesets-base';
import { Spectral } from '@stoplight/spectral-core';
// Use the spectral built in ruleset, or import your own!
import { oas } from '@stoplight/spectral-rulesets';

// This is the spectral class from the spectral-core package
// See how to use this https://meta.stoplight.io/docs/spectral/eb68e7afd463e-spectral-in-java-script
const spectral = new Spectral();
spectral.setRuleset(oas);

const name = 'spectral-rules';
export default {
  name,
  description: 'A Spectral ruleset in Optic',
  configSchema: {},
  rulesetConstructor: () => {
    return new SpectralRule({
      spectral,
      name,
      applies: 'added', // will only trigger on nodes that were added
    });
  },
};
```

After setting up this file, you can build the package and start using Spectral in Optic:

- `yarn run build`
- (optional) Upload your spectral rule to Optic
  - `OPTIC_TOKEN=<token> yarn run upload`
  - (get an OPTIC_TOKEN at [app.useoptic.com](app.useoptic.com))
- Run checks with this ruleset by adding rulesets into your [`optic.dev.yml`](../optic/README.md#quick-start-guide) file at the root of your project.
  - you can refer to the uploaded ruleset (`@organization/ruleset-name`)
  - or you can use a local path `./<path_to_ruleset_project>/build/main.js`

## Reference details

Reference documentation can be found [here](./docs/Reference.md)
