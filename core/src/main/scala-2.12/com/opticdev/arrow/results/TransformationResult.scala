package com.opticdev.arrow.results

import com.opticdev.arrow.changes.location.AsChildOf
import com.opticdev.arrow.changes._
import com.opticdev.arrow.context.{ArrowContextBase, ModelContext}
import com.opticdev.arrow.graph.KnowledgeGraph
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.{DirectTransformation, TransformationChanges}
import com.opticdev.core.sourcegear.SourceGear
import play.api.libs.json.{JsNull, JsObject, JsString, JsValue}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits._
import com.opticdev.arrow.search.TransformationSearch
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.common.SchemaRef
import com.opticdev.sdk.descriptions.transformation.Transformation

import scala.util.Try
import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
case class TransformationResult(score: Int, transformationChange: TransformationChanges, context : ArrowContextBase, inputValue: Option[JsObject], inputModelId: Option[String], objectSelection: Option[String])(implicit sourcegear: SourceGear, project: OpticProject, knowledgeGraph: KnowledgeGraph, editorSlug: String) extends Result {

  override def changes : ChangeGroup = {

    val transformation = transformationChange match {
      case dt: DirectTransformation => {

        val insertLocationOption = context.toInsertLocation

        def modelOptions: Seq[ModelOption] = project.projectGraphWrapper.query((node)=> {
          node.value match {
            case mn: BaseModelNode => mn.schemaId == transformationChange.transformation.resolvedInput && mn.objectRef.isDefined
            case on: ObjectNode => on.schemaRef == transformationChange.transformation.resolvedInput
            case _ => false
          }
        }).map {
            case mn: BaseModelNode => {
              implicit val sourceGearContext = TransformationSearch.sourceGearContext(mn)
              val expandedValue = mn.expandedValue(withVariables = true)
              ModelOption(mn.id, expandedValue, mn.objectRef.get.name)
            }
            case on: ObjectNode =>
              ModelOption(on.id, on.value, on.name)
        }.toSeq.sortBy(_.name)

        val lensOptions = knowledgeGraph.gearsForSchema({
          if (dt.transformation.isGenerateTransform) {
            dt.transformation.resolvedOutput.get
          } else {
            dt.transformation.resolvedInput
          }
        }).map(i=> LensOption(i.name, i.lensRef.packageRef.get.full, i.lensRef.internalFull)).toSeq

        RunTransformation(
          transformationChange,
          inputValue,
          inputModelId,
          transformationChange.transformation.combinedAsk(inputValue.getOrElse(JsObject.empty)),
          lensOptions,
          None,
          if (insertLocationOption.isDefined) Seq(insertLocationOption.get) else Seq(), //@todo add all location options
          None,
          None,
          objectSelection,
          if (inputValue.isDefined) None else Some(modelOptions)
        )
      }
    }

    val changes = if (context.toInsertLocation.isDefined) {
      Seq(transformation, ClearSearchLines(context.toInsertLocation.get.file))
    } else {
      Seq(transformation)
    }

    ChangeGroup(changes:_*)

  }

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
      "changes" -> changes.asJson
    ))
  }

}
