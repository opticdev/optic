package com.opticdev.core.sourcegear.mutate

import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.model._
import com.opticdev.core.sourcegear.mutate.errors.{AstMappingNotFound, ComponentNotFound}
import com.opticdev.core.sourcegear.variables.VariableChanges
import com.opticdev.parsers.graph.CommonAstNode
import play.api.libs.json.JsObject
import com.opticdev.core.utils.StringBuilderImplicits._
import gnieh.diffson.playJson._
import com.opticdev.parsers.graph.path.PropertyPathWalker

import scala.collection.immutable

object MutationImplicits {
  implicit class MutableModelNode(linkedModelNode: LinkedModelNode[CommonAstNode]) {

    def requiredChangesForUpdate(newValue: JsObject, variableChanges: Option[VariableChanges] = None ) (implicit sourceGearContext: SGContext, fileContents: String): List[AstChange] = {
      import MutationSteps._
      val modelChanges: List[AstChange] = {
        val changesTry = collectFieldChanges(linkedModelNode, newValue)
        val containerChangesTry = if (!sourceGearContext.forRender) collectMapSchemaChanges(linkedModelNode, newValue, variableChanges) else List.empty

        handleChanges(
          changesTry.collect {case i if i.isSuccess => i.get},
          containerChangesTry.collect {case i if i.isSuccess => i.get}
        )
      }

      val variableEvaluatedChanges: List[AstChange] = if (variableChanges.isDefined)
        collectVariableChanges(linkedModelNode, variableChanges.get) else List.empty

      modelChanges ++ variableEvaluatedChanges
    }

    def update(newValue: JsObject, variableChanges: Option[VariableChanges] = None ) (implicit sourceGearContext: SGContext, fileContents: String): String = {
      import MutationSteps._
      combineChanges(requiredChangesForUpdate(newValue, variableChanges)).toString
    }

  }

  implicit class MutableMultiModelNode(multiModelNode: MultiModelNode) {
    def update(newValue: JsObject, variableChanges: Option[VariableChanges] = None ) (implicit sourceGearContext: SGContext, fileContents: String): String = {
      val changes = multiModelNode.modelNodes.flatMap(i=> {
        val resolvedNode: LinkedModelNode[CommonAstNode] = i.resolveInGraph[CommonAstNode](sourceGearContext.astGraph)
        resolvedNode.requiredChangesForUpdate(newValue, variableChanges)
      }).toList

      import MutationSteps._
      combineChanges(changes).toString
    }
  }

  implicit class MutableExpandedModelNode(expandedModelNode: ExpandedModelNode) {
    def update(newValue: JsObject, variableChanges: Option[VariableChanges] = None ) (implicit sourceGearContext: SGContext, fileContents: String): String = {
      expandedModelNode match {
        case mn: LinkedModelNode[CommonAstNode] => mn.update(newValue, variableChanges)
        case mmn: MultiModelNode => mmn.update(newValue, variableChanges)
      }
    }
  }

}
