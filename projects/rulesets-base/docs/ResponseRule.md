# ResponseRule

Creates an ResponseRule. An ResponseRule allows you to write assertions around responses in your API Specification.

```javascript
new ResponseRule({
  name: 'prevent response removal',
  rule: (responseAssertions) => {
    responseAssertions.removed('not remove response', () => {
      throw new RuleError({
        message: 'cannot remove an response',
      });
    });
  },
});
```

`new ResponseRule(options)`

The following table describes the options object.

| property | description                                                                                                                                                                                               | required | type                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| name     | the name of the rule                                                                                                                                                                                      | yes      | `string`                                                                     |
| matches  | A function used to determine when this Rule should be applied. Return true to indicate this Rule should run.                                                                                              | no       | `(response: Response, ruleContext: RuleContext) => boolean`              |
| docsLink | A link to the documentation for this ruleset. This will be used to show the user on a rule error. If there is a more specific docsLink (e.g. on a nested Rule), the more specific docsLink will be shown) | no       | `string`                                                                     |
| rule     | A function to define assertions for a specification.                                                                                                                                                      | yes      | `(responseAssertions: ResponseAssertions, ruleContext: RuleContext) => void` |

## matches

`matches` is invoked with a `Response` and `RuleContext` objects. The [`Response` object](./DataShapes.md#response) corresponds to the `Response` that this rule would run on. The [RuleContext object](./DataShapes.md#rulecontext) contains details about the location, and any [custom context](./Reference.md#custom-context). Return a boolean to indicate whether this rule should be run on the `Response` provided.

Example:

```javascript
new ResponseRule({
  ...,
  // only matches responses with content type 'application/json' and status code 201 in post operations
  matches: (response, ruleContext) => (
    ruleContext.operation.method === 'post' &&
    response.statusCode === '201'
  ),
  ...
});
```

## responseAssertions

responseAssertions is used to define response rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in an assertion, which is a function that receives a [`Response` object](./DataShapes.md#response). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`responseAssertions[lifecycle](assertion)`

```javascript
new ResponseRule({
  ...,
  rule: (responseAssertions) => {
    // lifecycle rules that are available are added, changed, addedOrChanged, requirement and removed
    responseAssertions.added('contain description', (response) => {
      if (!response.value.description) {
        throw new RuleError({
          message: 'response must contain a description',
        });
      }
    });
  },
});
```

responseAssertions also includes a number of common helper functions. These are invoked by defining a lifecycle trigger, and then the helper function. e.g. `responseAssertions[lifecycle].helperFunction()`.

The helper functions that are included are:

- hasResponseHeaderMatching

All of these helper functions can be inverted by prefixing with `.not`.

e.g. `responseAssertions.added.not.hasResponseHeaderMatching('X-Application', { description: Matchers.string })`

### hasResponseHeaderMatching

`responseAssertions[lifecycle].hasResponseHeaderMatching(headerName, shape)`

Expects the operation to match a shape. The default behavior is to do a partial match. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
import { Matchers } from '@useoptic/rulesets-base';

new ResponseRule({
  ...,
  rule: (responseAssertions) => {
    responseAssertions.added.hasResponseHeaderMatching('X-Application', {
      description: Matchers.string
    });
  },
});
```

## responseAssertions.header

responseAssertions.header is used to define response header rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in an assertion, which is a function that receives a [`Response Header` object](./DataShapes.md#responseheader). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`responseAssertions.header[lifecycle](assertion)`

```javascript
new ResponseRule({
  ...,
  rule: (responseAssertions) => {
    // lifecycle rules that are available are added, changed, addedOrChanged, requirement and removed
    responseAssertions.header.added('contains a description', (header) => {
      if (!header.value.description) {
        throw new RuleError({
          message: 'header must contain a description',
        });
      }
    });
  },
});
```
