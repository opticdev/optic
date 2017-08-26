package sourcegear.gears

import cognitro.parsers.GraphUtils.AstType
import sdk.descriptions.{ChildrenRule, ChildrenRuleType, Rule}

class RuleProvider(defaultRules: Map[AstType, Vector[Rule]] = Map()) {

  val globalChildrenDefaultRule = ChildrenRule(null, ChildrenRuleType.Exact)

  //@todo doing this at every node may not be performant. better way possible
  def applyDefaultRulesForType(rules: Vector[Rule], astType: AstType) = {

    var updatedRules: Vector[Rule] = rules

    //add the default rule for children only if one is not already set
    if (!rules.exists(_.isChildrenRule)) {
      val defaultOption = defaultRules.get(astType)
      if (defaultOption.isDefined && defaultOption.get.exists(_.isChildrenRule)) {
        updatedRules = updatedRules ++ defaultOption.get.filter(_.isChildrenRule)
      }
    }

    updatedRules
  }
}
