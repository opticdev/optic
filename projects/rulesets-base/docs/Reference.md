# Rules

There are 5 different rules you can use to enforce API Changes. These are:

- [OperationRule](./OperationRule.md)
- [RequestRule]('./RequestRule.md')
- [ResponseRule]('./ResponseRule.md)
- [ResponseBodyRule]('./ResponseBodyRule.md)
- [SpecificationRule]('./SpecificationRule.md')

Rules can be grouped together into a [Ruleset](./Ruleset.md).

## Assertions

There are 4 different lifecycles you can attach a rule onto. These lifecycles determine when a rule should be run. The 4 lifecycles are: `added`, `changed`, `removed` and `requirement`.

- `added` - runs when added
- `changed` - runs when changed
- `removed` - runs when removed
- `requirement` - always runs

For example, a query parameter assertion with an added rule lifecycle (below) will run every time a query parameter is added.

```javascript
new OperationRule({
  ...,
  rule: (operationAssertions) => {
    operationAssertions.queryParameter.added('not add a required query parameter', () => {
      // rule implementation goes here
    })
  }
})
```

## Matcher helpers

`.matches` assertion helpers can be used to match expected open api shapes. By default, `.matches` does a partial match, meaning that if the received value has extra keys, matches will still recognize it as a match. E.g.

```javascript
.matches({
  description: 'api description'
})

will match the following objects
{
  description: 'api description'
}

{
  description: 'api description',
  tags: ['get', 'examples']
}
```

Matches can be configured with a second argument - `assertion.added.matches(structureToMatch, options)`

The following table describes the options object.

| property     | description                                                       | required | type      |
| ------------ | ----------------------------------------------------------------- | -------- | --------- |
| strict       | runs a partial match if false, otherwise looks for an exact match | no       | `boolean` |
| errorMessage | provide a custom error message if this matches block fails        | no       | `string`  |

Additionally, if you want to define custom matchers, you can use the following helpers

```javascript
import { Matcher, Matchers } from '@useoptic/rulesets-base';

assertion.added.matches({
  description: Matchers.string, // matches any string
  ['x-enabled']: Matchers.boolean, // matches any boolean
  ['x-version']: Matchers.number, // matches any number
});

// Additionally you can create your own custom matcher
const urlMatcher = new Matcher(
  (value: any) => typeof value === 'string' && /^https?/i.test(value)
);
```

## Custom context

Custom context can be generated from passing in a function to `optic.config.js`.

```javascript
// optic.config.js
module.exports = {
  generateContext: (details: {fileName: string}) => {
    value: 123,
    date: new Date()
  }
}
```

This context will then be accessible under `RuleContext.custom` - [see details](./DataShapes.md#rulecontext)

## Rule error

The RuleError is used to indicate there was a failed rule in the test runner. RuleError has the options:

```javascript
new RuleError({
  message: 'message to display if thrown',
});
// additionally, you can pass in expected and received arguments for raw values you expect
new RuleError({
  message: 'message to display',
  expected: {
    description: 'hello',
  },
  received: operation.value,
});
```
