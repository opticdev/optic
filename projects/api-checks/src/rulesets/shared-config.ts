export enum RuleApplies {
  always = 'always',
  whenAdded = 'whenAdded',
  whenAddedOrChanged = 'whenAddedOrChanged',
}

export function ruleAppliesToLifeCycleKeyword(
  applies: RuleApplies
): 'requirement' | 'requirementOnChange' | 'added' {
  switch (applies) {
    case RuleApplies.always:
      return 'requirement';
    case RuleApplies.whenAddedOrChanged:
      return 'requirementOnChange';
    case RuleApplies.whenAdded:
      return 'added';
  }
}
