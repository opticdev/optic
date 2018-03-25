package com.opticdev.core.sourcegear

import com.opticdev.parsers.IdentifierNodeDesc
import com.opticdev.sdk.descriptions.Variable

package object variables {
  case class SetVariable(variable: Variable, value: String)
  case class VariableChanges(identifierNodeDesc: IdentifierNodeDesc, changes: Vector[SetVariable]) {
    def hasChanges : Boolean = changes.nonEmpty
  }
}