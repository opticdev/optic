package com.opticdev.core.sourcegear.mutate

import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode, Path}
import com.opticdev.core.sourcegear.mutate.errors.{AstMappingNotFound, ComponentNotFound}
import com.opticdev.core.sourcegear.variables.{VariableChanges}
import play.api.libs.json.JsObject
import gnieh.diffson.playJson._
import com.opticdev.parsers.graph.path.PropertyPathWalker

import scala.collection.immutable

object MutationImplicits {
  implicit class MutableModelNode(linkedModelNode: LinkedModelNode) {

    def update(newValue: JsObject, variableChanges: Option[VariableChanges] = None ) (implicit sourceGearContext: SGContext, fileContents: String): String = {
      import MutationSteps._
      val modelChanges: List[AstChange] = {
        val changesTry = collectFieldChanges(linkedModelNode, newValue)

        val changes = changesTry.filter(_.isSuccess).map(_.get)

        handleChanges(changes)
      }

      val variableEvaluatedChanges: List[AstChange] = if (variableChanges.isDefined)
        collectVariableChanges(linkedModelNode, variableChanges.get) else List.empty

      combineChanges(modelChanges ++ variableEvaluatedChanges).toString
    }

  }
}
