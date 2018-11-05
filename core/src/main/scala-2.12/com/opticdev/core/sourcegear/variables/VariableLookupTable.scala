package com.opticdev.core.sourcegear.variables

import com.opticdev.parsers.graph.{AstType, CommonAstNode}
import com.opticdev.sdk.VariableMapping
import com.opticdev.sdk.descriptions.VariableRule
import com.opticdev.sdk.skills_sdk.compilerInputs.variables.OMVariable
import com.sun.org.apache.xpath.internal.operations.Variable
import play.api.libs.json.{JsObject, JsString}

case class VariableLookupTable(variables: Vector[OMVariable], identifierValuePath: String, nodeType: AstType) {

  private val assignments = collection.mutable.Map[OMVariable, String]()

  def reset = assignments.clear()

  def lookupVariableValue(forId: String): Option[OMVariable] = variables.find(_.token == forId)

  def matchesVariableValue(forId: String, value: String) : Boolean = {
    val variable = variables.find(_.token == forId)

    if (variable.isDefined) {
      val setOption = assignments.get(variable.get)

      if (setOption.isDefined) {
        setOption.get == value
      } else {
        assignments.put(variable.get, value)
        true
      }

    } else false
  }

  def astNodeMatchesVariable(variableRule: VariableRule, CommonAstNode: CommonAstNode) : Boolean = {
    if (CommonAstNode.nodeType == nodeType) {
      val instanceValue = CommonAstNode.properties.as[JsObject].value(identifierValuePath).as[JsString].value
      matchesVariableValue(variableRule.variableId, instanceValue)
    } else false
  }

  def toVariableMapping : VariableMapping = assignments.map(i=> {
    (i._1.token, i._2)
  }).toMap

}
