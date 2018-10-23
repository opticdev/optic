package com.opticdev.arrow.results

import com.opticdev.arrow.changes.location.AsChildOf
import com.opticdev.arrow.changes._
import com.opticdev.arrow.context.{ArrowContextBase, ModelContext}
import com.opticdev.arrow.graph.KnowledgeGraph
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.{DirectTransformation, TransformationChanges}
import com.opticdev.core.sourcegear.{SGContext, SourceGear}
import play.api.libs.json.{JsNull, JsObject, JsString, JsValue}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits._
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.sdk.descriptions.transformation.Transformation

import scala.util.Try
import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
case class TransformationResult(score: Int, transformationChange: TransformationChanges, context : ArrowContextBase, inputValue: Option[JsObject], inputModelId: Option[String], objectSelection: Option[String])(implicit sourcegear: SourceGear, project: OpticProject, knowledgeGraph: KnowledgeGraph, editorSlug: String) extends Result {

  override def asJson = {
    JsObject(Seq(
      "name" -> JsString(transformationChange.transformation.yields),
      "projectName" -> JsString(project.name),
      "editorSlug" -> JsString(editorSlug),
      "packageId" -> JsString(transformationChange.transformation.packageId.full),
      "input" -> JsString(transformationChange.transformation.resolvedInput.full),
      "output" -> {
        if (transformationChange.transformation.isGenerateTransform) {
          JsString(transformationChange.transformation.resolvedOutput.get.full)
        } else {
          JsNull
        }
      },
//      "changes" -> changes.asJson
    ))
  }

  override def changes: ChangeGroup = null
}
