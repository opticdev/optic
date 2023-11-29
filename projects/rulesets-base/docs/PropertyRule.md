# PropertyRule

Creates an PropertyRule. An PropertyRule allows you to write assertions about the properties in request and response bodies. 

```javascript
new PropertyRule({
  name: 'require example',
  rule: (propertyAssertions) => {
    propertyAssertions.requirement('require examples for all properties ', (property) => {
        if (!property.example) {
            throw new RuleError({
                message: `${property.key} needs an example`,
            });
        }
    });
  },
});
```

`new PropertyRule(options)`

The following table describes the options object.

| property | description                                                                                                                                                                                               | required | type                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| name     | the name of the rule                                                                                                                                                                                      | yes      | `string`                                                               |
| matches  | A function used to determine when this Rule should be applied. Return true to indicate this Rule should run.                                                                                              | no       | `(property: Property, ruleContext: RuleContext) => boolean`              |
| docsLink | A link to the documentation for this ruleset. This will be used to show the user on a rule error. If there is a more specific docsLink (e.g. on a nested Rule), the more specific docsLink will be shown) | no       | `string`                                                               |
| rule     | A function to define assertions for a property.                                                                                                                                                      | yes      | `(propertyAssertions: PropertyAssertions, ruleContext: RuleContext) => void` |

## matches

`matches` is invoked with a `Property` and `RuleContext` objects. The `Property` object shape is [described here](./DataShapes.md#property). The [RuleContext object](./DataShapes.md#rulecontext) contains details about the location, and any [custom context](./Reference.md#custom-context). Return a boolean to indicate whether this rule should be run on the `Property` provided.

Example:

```javascript
new PropertyRule({
  ...,
  // only runs on properties that have type 'number'
  matches: (property, ruleContext) => property.value.flatSchema.type === 'number',
  ...
});
```

## propertyAssertions

propertyAssertions is used to define property rules. There are [4 lifecycle triggers](./Reference.md#assertions) for registering rules which defines when they are triggered. A rule can be defined by an assertion, which is a function that receives a [`Property` object](./DataShapes.md#property). Throwing a `RuleError` represents a failure, RuleError [details below](./Reference.md#rule-error).

`propertyAssertions[lifecycle](assertion)`

```javascript
new PropertyRule({
  ...,
  rule: (propertyAssertions) => {
    // lifecycle rules that are available are added, changed, addedOrChanged, requirement and removed
    propertyAssertions.added('contains a description', (property) => {
      if (!property.value.description) {
        throw new RuleError({
          message: 'properties must contain a description',
        });
      }
    });
  },
});
```
