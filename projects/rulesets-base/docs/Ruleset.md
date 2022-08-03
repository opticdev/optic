# Ruleset

A ruleset is a grouping of rules. A ruleset can contain it's own name, rules, docsLink and matches block.

If a ruleset and rule provide their own matches blocks, both matches have to return true for the rule to be applied. If a ruleset and rule both provide their own docsLink, the Rule docsLink will be shown.

`new Ruleset(options)`

The following table describes the options object.

| property | description                                                                                                                                                                                               | required | type                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------- |
| name     | the name of the rule                                                                                                                                                                                      | yes      | `string`                                |
| matches  | A function used to determine when this Rule should be applied. Return true to indicate this Rule should run.                                                                                              | no       | `(ruleContext: RuleContext) => boolean` |
| docsLink | A link to the documentation for this ruleset. This will be used to show the user on a rule error. If there is a more specific docsLink (e.g. on a nested Rule), the more specific docsLink will be shown) | no       | `string`                                |
| rules    | An array containing the list of rules, these can be a SpecificationRule, OperationRule, RequestRule, ResponseRule, or ResponseBodyRule.                                                                   | yes      | `Rule[]`                                |

