# SpecificationRule

Creates an SpecificationRule. An SpecificationRule allows you to write assertions around the root open api metadata in your API Specification.

```javascript
new SpecificationRule({
  name: 'require x-stability',
  rule: (specificationAssertions) => {
    specificationAssertions.removed('not remove request', () => {
      throw new RuleError({
        message: 'cannot remove an request',
      });
    });
  },
});
```

`new SpecificationRule(options)`

The following table describes the options object.

| property | description                                                                                                                                                                                               | required | type                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| name     | the name of the rule                                                                                                                                                                                      | yes      | `string`                                                               |
| matches  | A function used to determine when this Rule should be applied. Return true to indicate this Rule should run.                                                                                              | no       | `(specification: Specification, ruleContext: RuleContext) => boolean`              |
| docsLink | A link to the documentation for this ruleset. This will be used to show the user on a rule error. If there is a more specific docsLink (e.g. on a nested Rule), the more specific docsLink will be shown) | no       | `string`                                                               |
| rule     | A function to define assertions for a specification.                                                                                                                                                      | yes      | `(specificationAssertions: SpecificationAssertions, ruleContext: RuleContext) => void` |

## matches

`matches` is invoked with a `Specification` and `RuleContext` objects. The `Specification` object shape is [described here](./DataShapes.md#specification). The [RuleContext object](./DataShapes.md#rulecontext) contains details about the location, and any [custom context](./Reference.md#custom-context). Return a boolean to indicate whether this rule should be run on the `Specification` provided.

Example:

```javascript
new SpecificationRule({
  ...,
  // only runs on specifications that are not `x-stability: wip`
  matches: (specification, ruleContext) => specification['x-stability'] !== 'wip',
  ...
});
```

## specificationAssertions

specificationAssertions is used to define specification rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by passing in a condition (`string`), and an assertion, which is a function that receives a [`Specification` object](./DataShapes.md#specification). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`specificationAssertions[lifecycle](condition, assertion)`

```javascript
new SpecificationRule({
  ...,
  rule: (specificationAssertions) => {
    // lifecycle rules that are available are added, changed, addedOrChanged, requirement and removed
    specificationAssertions.added('contains a description', (specification) => {
      if (!specification.value.description) {
        throw new RuleError({
          message: 'specifications must contain a description',
        });
      }
    });
  },
});
```

specificationAssertions also includes a number of common helper functions. These are invoked by defining a lifecycle trigger, and then the helper function. e.g. `specificationAssertions[lifecycle].helperFunction()`.

The helper functions that are included are:

- matches
- matchesOneOf

All of these helper functions can be inverted by prefixing with `.not`.

e.g. `specificationAssertions.added.not.matches({ schema: { type: 'array' } })`

### matches

`specificationAssertions[lifecycle].matches(shape)`

Expects the operation to match a shape. The default behavior is to do a partial match. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
import { Matchers } from '@useoptic/rulesets-base';

new SpecificationRule({
  ...,
  rule: (specificationAssertions) => {
    specificationAssertions.added.matches({
      description: Matchers.string
    });
  },
});
```

### matchesOneOf

`specificationAssertions[lifecycle].matches(shape)`

Expects the operation to match one of an array of shapes. The default behavior is to do a partial match. For more details about the matches helper - [see here](./Reference.md#matcher-helpers)

```javascript
import { Matchers } from '@useoptic/rulesets-base';

new SpecificationRule({
  ...,
  rule: (specificationAssertions) => {
    specificationAssertions.added.matches([
      { description: Matchers.string },
      { summary: Matchers.string },
    ]);
  },
});
```
