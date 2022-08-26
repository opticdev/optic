# RequestRule

Creates an RequestRule. An RequestRule allows you to write assertions around Requests in your API Specification.

```javascript
new RequestRule({
  name: 'prevent request removal',
  rule: (requestAssertions) => {
    requestAssertions.body.removed('not remove request', () => {
      throw new RuleError({
        message: 'cannot remove an request',
      });
    });
  },
});
```

`new RequestRule(options)`

The following table describes the options object.

| property | description                                                                                                                                                                                               | required | type                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| name     | the name of the rule                                                                                                                                                                                      | yes      | `string`                                                               |
| matches  | A function used to determine when this Rule should be applied. Return true to indicate this Rule should run.                                                                                              | no       | `(request: RequestBody, ruleContext: RuleContext) => boolean`              |
| docsLink | A link to the documentation for this ruleset. This will be used to show the user on a rule error. If there is a more specific docsLink (e.g. on a nested Rule), the more specific docsLink will be shown) | no       | `string`                                                               |
| rule     | A function to define assertions for a specification.                                                                                                                                                      | yes      | `(requestAssertions: RequestAssertions, ruleContext: RuleContext) => void` |

## matches

`matches` is invoked with a `RequestBody` and `RuleContext` objects. The [`RequestBody` object](./DataShapes.md#requestbody) corresponds to the `RequestBody` that this rule would run on. The [RuleContext object](./DataShapes.md#rulecontext) contains details about the location, and any [custom context](./Reference.md#custom-context). Return a boolean to indicate whether this rule should be run on the `RequestBody` provided.

Example:

```javascript
new RequestRule({
  ...,
  // only matches requests with content type 'application/json' in post operations
  matches: (request, ruleContext) => ruleContext.operation.method === 'post' && request.contentType === 'application/json',
  ...
});
```

## requestAssertions.body

requestAssertions.body is used to define request rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in a condition (`string`), and an assertion, which is a function that receives a [`RequestBody` object](./DataShapes.md#requestbody). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`requestAssertions.body[lifecycle](condition, assertion)`

```javascript
new RequestRule({
  ...,
  rule: (requestAssertions) => {
    // lifecycle rules that are available are added, changed, addedOrChanged, requirement and removed
    requestAssertions.body.added('contain description', (request) => {
      if (!request.value.description) {
        throw new RuleError({
          message: 'requests must contain a description',
        });
      }
    });
  },
});
```

requestAssertions.body also includes a number of common helper functions. These are invoked by defining a lifecycle trigger, and then the helper function. e.g. `requestAssertions.body[lifecycle].helperFunction()`.

The helper functions that are included are:

- matches
- matchesOneOf

All of these helper functions can be inverted by prefixing with `.not`.

e.g. `requestAssertions.body.added.not.matches({ schema: { type: 'array' } })`

### matches

`requestAssertions.body[lifecycle].matches(shape)`

Expects the operation to match a shape. The default behavior is to do a partial match. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
import { Matchers } from '@useoptic/rulesets-base';

new RequestRule({
  ...,
  rule: (requestAssertions) => {
    requestAssertions.body.added.matches({
      description: Matchers.string
    });
  },
});
```

### matchesOneOf

`requestAssertions.body[lifecycle].matches(shape)`

Expects the operation to match one of an array of shapes. The default behavior is to do a partial match. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
import { Matchers } from '@useoptic/rulesets-base';

new RequestRule({
  ...,
  rule: (requestAssertions) => {
    requestAssertions.body.added.matches([
      { description: Matchers.string },
      { summary: Matchers.string },
    ]);
  },
});
```

## requestAssertions.property

requestAssertions.property is used to define request body property rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in a condition (`string`), and an assertion, which is a function that receives a [`Field` object](./DataShapes.md#field). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`requestAssertions.property[lifecycle](condition, assertion)`

```javascript
new RequestRule({
  ...,
  rule: (requestAssertions) => {
    // lifecycle rules that are available are added, changed, addedOrChanged, requirement and removed
    requestAssertions.property.added('contains a type', (property) => {
      if (!property.value.type) {
        throw new RuleError({
          message: 'properties must contain a type',
        });
      }
    });
  },
});
```
