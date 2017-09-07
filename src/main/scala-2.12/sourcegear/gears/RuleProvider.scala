package sourcegear.gears

import optic.parsers.GraphUtils.AstType
import sdk.descriptions.{ChildrenRule, Rule}
import sdk.descriptions.enums.RuleEnums._


class RuleProvider(defaultRules: Map[AstType, Vector[Rule]] = Map()) {

  val globalChildrenDefaultRule = ChildrenRule(null, Exact)

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
