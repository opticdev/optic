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
    operationAssertions.requirement.hasStatusCodes([201]);
    // Or you can write this manually
    operationAssertions.requirement('must have 201 status code', (value) => {
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

[Breaking Changes](../standard-rulesets//src/breaking-changes/) and [Naming rules](../standard-rulesets//src/naming-changes/) are examples of rulesets implemented using rulesets-base.

## Testing rulesets

rulesets-base also includes a few testing helpers for writing your own tests.

```javascript
import { TestHelpers } from '@useoptic/rulesets-base';
// or
const { TestHelpers } = require('@useoptic/rulesets-base')

...
const RuleToTest = new OperationRule(...);

test('test that my rule works', () => {
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
  const ruleResults = TestHelpers.runRulesWithInputs(
    [RuleToTest],
    beforeApiSpec,
    afterApiSpec
  );
  // You can use your own test library
  // e.g. with jest
  expect(ruleResults).toMatchSnapshot();
})
```
