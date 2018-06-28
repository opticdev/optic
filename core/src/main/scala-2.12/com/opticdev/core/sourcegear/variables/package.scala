package com.opticdev.core.sourcegear

import com.opticdev.parsers.{IdentifierNodeDesc, ParserBase}
import com.opticdev.sdk.VariableMapping
import com.opticdev.sdk.opticmarkdown2.compilerInputs.variables.OMVariable
import com.opticdev.sdk.opticmarkdown2.lens.Self

package object variables {
  case class SetVariable(variable: OMVariable, value: String)
  case class VariableChanges(identifierNodeDesc: IdentifierNodeDesc, changes: Vector[SetVariable]) {
    def hasChanges : Boolean = changes.nonEmpty
  }

  object VariableChanges {
    def fromVariableMapping(variableMapping: VariableMapping, parser: ParserBase) = {
      VariableChanges(parser.identifierNodeDesc, variableMapping.map(i=> SetVariable(OMVariable(i._1, Self), i._2)).toVector)
    }
  }
}