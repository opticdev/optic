package com.opticdev.core.sourcegear.variables

import com.opticdev.parsers.graph.AstPrimitiveNode
import com.opticdev.sdk.descriptions.{Variable, VariableRule}

class VariableLookupTable(variables: Vector[Variable], astToVariableInstance: (AstPrimitiveNode) => String) {

  private val assignments = collection.mutable.Map[Variable, String]()

  def reset = assignments.clear()

  def lookupVariableValue(forId: String): Option[Variable] = variables.find(_.token == forId)

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

  def astNodeMatchesVariable(variableRule: VariableRule, astPrimitiveNode: AstPrimitiveNode) : Boolean = {
    val instanceValue = astToVariableInstance(astPrimitiveNode)
    matchesVariableValue(variableRule.variableId, instanceValue)
  }

}
