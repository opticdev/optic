# ResponseBodyRule

Creates an ResponseBodyRule. An ResponseBodyRule allows you to write assertions around response bodies in your API Specification.

```javascript
new ResponseBodyRule({
  name: 'prevent response body removal',
  rule: (responseBodyAssertions) => {
    responseBodyAssertions.body.removed('not remove response', () => {
      throw new RuleError({
        message: 'cannot remove an response',
      });
    });
  },
});
```

`new ResponseBodyRule(options)`

The following table describes the options object.

| property | description                                                                                                                                                                                               | required | type                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| name     | the name of the rule                                                                                                                                                                                      | yes      | `string`                                                                     |
| matches  | A function used to determine when this Rule should be applied. Return true to indicate this Rule should run.                                                                                              | no       | `(response: ResponseBody, ruleContext: RuleContext) => boolean`              |
| docsLink | A link to the documentation for this ruleset. This will be used to show the user on a rule error. If there is a more specific docsLink (e.g. on a nested Rule), the more specific docsLink will be shown) | no       | `string`                                                                     |
| rule     | A function to define assertions for a specification.                                                                                                                                                      | yes      | `(responseBodyAssertions: ResponseBodyAssertions, ruleContext: RuleContext) => void` |

## matches

`matches` is invoked with a `ResponseBody` and `RuleContext` objects. The [`ResponseBody` object](./DataShapes.md#responsebody) corresponds to the `ResponseBody` that this rule would run on. The [RuleContext object](./DataShapes.md#rulecontext) contains details about the location, and any [custom context](./Reference.md#custom-context). Return a boolean to indicate whether this rule should be run on the `ResponseBody` provided.

Example:

```javascript
new ResponseBodyRule({
  ...,
  // only matches responses with content type 'application/json' and status code 201 in post operations
  matches: (response, ruleContext) => (
    ruleContext.operation.method === 'post' &&
    response.contentType === 'application/json' &&
    response.statusCode === '201'
  ),
  ...
});
```

## responseBodyAssertions.body

responseBodyAssertions.body is used to define response rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in a condition (`string`), and an assertion, which is a function that receives a [`ResponseBody` object](./DataShapes.md#responsebody). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`responseBodyAssertions.body[lifecycle](condition, assertion)`

```javascript
new ResponseBodyRule({
  ...,
  rule: (responseBodyAssertions) => {
    // lifecycle rules that are available are added, changed, addedOrChanged, requirement and removed
    responseBodyAssertions.body.added('contain description', (response) => {
      if (!response.value.description) {
        throw new RuleError({
          message: 'response bodies must contain a description',
        });
      }
    });
  },
});
```

responseBodyAssertions.body also includes a number of common helper functions. These are invoked by defining a lifecycle trigger, and then the helper function. e.g. `responseBodyAssertions.body[lifecycle].helperFunction()`.

The helper functions that are included are:

- matches
- matchesOneOf

All of these helper functions can be inverted by prefixing with `.not`.

e.g. `responseBodyAssertions.body.added.not.matches({ schema: { type: 'array' } })`

### matches

`responseBodyAssertions.body[lifecycle].matches(shape)`

Expects the operation to match a shape. The default behavior is to do a partial match. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
import { Matchers } from '@useoptic/rulesets-base';

new ResponseBodyRule({
  ...,
  rule: (responseBodyAssertions) => {
    responseBodyAssertions.body.added.matches({
      description: Matchers.string
    });
  },
});
```

### matchesOneOf

`responseBodyAssertions.body[lifecycle].matches(shape)`

Expects the operation to match one of an array of shapes. The default behavior is to do a partial match. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
import { Matchers } from '@useoptic/rulesets-base';

new ResponseBodyRule({
  ...,
  rule: (responseBodyAssertions) => {
    responseBodyAssertions.body.added.matches([
      { description: Matchers.string },
      { summary: Matchers.string },
    ]);
  },
});
```

## responseBodyAssertions.property

responseBodyAssertions.property is used to define response body property rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in a condition (`string`), and an assertion, which is a function that receives a [`Field` object](./DataShapes.md#field). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`responseBodyAssertions.property[lifecycle](condition, assertion)`

```javascript
new ResponseBodyRule({
  ...,
  rule: (responseBodyAssertions) => {
    // lifecycle rules that are available are added, changed, addedOrChanged, requirement and removed
    responseBodyAssertions.property.added('contains a type', (property) => {
      if (!property.value.type) {
        throw new RuleError({
          message: 'properties must contain a type',
        });
      }
    });
  },
});
```
