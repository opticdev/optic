package com.opticdev.core.sourcegear.gears

import com.opticdev.parsers.ParserBase
import com.opticdev.sdk.descriptions.ChildrenRule
import com.opticdev.common.graph.AstType
import com.opticdev.sdk.rules._
import com.opticdev.sdk.rules.{AllChildrenRule, Exact, Rule}


object RuleProvider {

  val globalChildrenDefaultRule = AllChildrenRule(Exact)

  //@todo doing this at every node may not be performant. better way possible
  def applyDefaultRulesForType(rules: Vector[Rule], astType: AstType)(implicit parser: ParserBase) : Vector[Rule] = {

    //add the default rule for children only if one is not already set
    if (!rules.exists(_.isChildrenRule)) {
      val defaultRulesForType = parser.defaultChildrenRules.get(astType)
      if (defaultRulesForType.isDefined) {
        rules ++ parser.defaultChildrenRules(astType) :+ globalChildrenDefaultRule
      } else {
        rules :+ globalChildrenDefaultRule
      }
    } else {
      rules.map {
        case i: ChildrenRule => i.asParserChildrenRule
        case other => other
      } ++ parser.defaultChildrenRules.getOrElse(astType, Vector())
    }

  }

}
