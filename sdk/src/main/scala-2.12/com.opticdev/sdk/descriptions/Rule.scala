package com.opticdev.sdk.descriptions

import com.opticdev.sdk.rules.{AllChildrenRule, ChildrenRuleTypeEnum, ParserChildrenRule, Rule}
import com.opticdev.sdk.PropertyValue
import com.opticdev.sdk.skills_sdk.lens.{OMFinder, OMLensNodeFinder}
import play.api.libs.json.{JsError, JsSuccess, _}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import enums.RuleEnums._

sealed trait RuleWithFinder extends Rule {
  def finder: OMFinder
}

/* SDK Configurable Rules */
//@todo make comparator an enum
case class RawRule(finder: OMFinder, comparator: String, value: String = "") extends RuleWithFinder {
  override val isRawRule = true
}

case class PropertyRule(finder: OMFinder, key: String, comparator: String, value: PropertyValue = null) extends RuleWithFinder {
  override val isPropertyRule = true
}

case class ChildrenRule(finder: OMFinder, rule: ChildrenRuleTypeEnum) extends RuleWithFinder {
  override val isChildrenRule = true
  def asParserChildrenRule = AllChildrenRule(rule)
}

/* Implicit Rules */
case class VariableRule(finder: OMFinder, variableId: String) extends RuleWithFinder {
  override val isVariableRule = true
}