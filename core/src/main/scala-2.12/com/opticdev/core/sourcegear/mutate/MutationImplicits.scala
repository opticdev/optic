package com.opticdev.core.sourcegear.mutate

import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode, Path}
import com.opticdev.core.sourcegear.mutate.errors.{AstMappingNotFound, ComponentNotFound}
import play.api.libs.json.JsObject
import gnieh.diffson.playJson._
import com.opticdev.core.utils.DiffOperationImplicits._
import com.opticdev.parsers.graph.path.PropertyPathWalker

object MutationImplicits {
  implicit class MutableModelNode(linkedModelNode: LinkedModelNode) {

    def update(newValue: JsObject) (implicit sourceGearContext: SGContext, fileContents: String): String = {
      import MutationSteps._
      val changesTry = collectChanges(linkedModelNode, newValue)

      //@todo replace this once we have the full system working
      val changes = changesTry.filter(_.isSuccess).map(_.get)

      val executedChanges = handleChanges(changes)

      combineChanges(executedChanges).toString
    }

  }
}
