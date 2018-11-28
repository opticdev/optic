package com.opticdev.sdk.rules

import com.opticdev.common.graph.AstType

trait ParserChildrenRule extends Rule{
  def rule: ChildrenRuleTypeEnum
  override val isChildrenRule = true
}

case class AllChildrenRule(rule: ChildrenRuleTypeEnum) extends ParserChildrenRule
case class SpecificChildrenRule(edgeType: String, rule: ChildrenRuleTypeEnum) extends ParserChildrenRule
