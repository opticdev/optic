package com.opticdev.core.sourcegear.mutate

import com.opticdev.core.sourcegear.SourceGearContext
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode, Path}
import com.opticdev.core.sourcegear.mutate.errors.{AstMappingNotFound, ComponentNotFound}
import play.api.libs.json.JsObject
import gnieh.diffson.playJson._
import com.opticdev.core.utils.DiffOperationImplicits._
import com.opticdev.parsers.graph.path.PropertyPathWalker

object MutationImplicits {
  implicit class MutableModelNode(linkedModelNode: LinkedModelNode) {

    def update(newValue: JsObject) (implicit sourceGearContext: SourceGearContext, fileContents: String): String = {
      import MutationSteps._
      val changes = collectChanges(linkedModelNode, newValue)
      val executedChanges = handleChanges(changes)
      combineChanges(executedChanges).toString
    }

  }
}
