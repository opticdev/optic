package com.opticdev.core.sourcegear

import com.opticdev.parsers.{IdentifierNodeDesc, ParserBase}
import com.opticdev.sdk.VariableMapping
import com.opticdev.sdk.descriptions.Variable
import com.opticdev.sdk.descriptions.enums.VariableEnums.Self

package object variables {
  case class SetVariable(variable: Variable, value: String)
  case class VariableChanges(identifierNodeDesc: IdentifierNodeDesc, changes: Vector[SetVariable]) {
    def hasChanges : Boolean = changes.nonEmpty
  }

  object VariableChanges {
    def fromVariableMapping(variableMapping: VariableMapping, parser: ParserBase) = {
      VariableChanges(parser.identifierNodeDesc, variableMapping.map(i=> SetVariable(Variable(i._1, Self), i._2)).toVector)
    }
  }
}