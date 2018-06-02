package com.opticdev.arrow.results

import com.opticdev.arrow.changes.location.AsChildOf
import com.opticdev.arrow.changes.{ChangeGroup, LensOption, InsertModel, RunTransformation}
import com.opticdev.arrow.context.{ArrowContextBase, ModelContext}
import com.opticdev.arrow.graph.KnowledgeGraph
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.{DirectTransformation, TransformationChanges}
import com.opticdev.core.sourcegear.SourceGear
import play.api.libs.json.{JsObject, JsString, JsValue}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits._
import com.opticdev.arrow.search.TransformationSearch
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.transformation.Transformation

import scala.util.Try
import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
case class TransformationResult(score: Int, transformationChange: TransformationChanges, context : ArrowContextBase, inputValue: Option[JsObject], objectSelection: Option[String])(implicit sourcegear: SourceGear, project: OpticProject, knowledgeGraph: KnowledgeGraph, editorSlug: String) extends Result {

  override def changes : ChangeGroup = transformationChange match {
    case dt: DirectTransformation => {

      val insertLocationOption = context.toInsertLocation

      def modelOptions = project.projectGraphWrapper.query((node)=> {
        node.value match {
          case mn: BaseModelNode => mn.schemaId == transformationChange.transformation.resolvedInput && mn.objectRef.isDefined
          case _ => false
        }
      }).asInstanceOf[Set[BaseModelNode]]
        .map(i=> {
          implicit val sourceGearContext = TransformationSearch.sourceGearContext(i)
          val expandedValue = i.expandedValue(withVariables = true)
          ModelOption(i.id, expandedValue, i.objectRef.get.name)
        }).toSeq.sortBy(_.name)

      ChangeGroup(RunTransformation(
        transformationChange,
        inputValue,
        knowledgeGraph.gearsForSchema(dt.transformation.resolvedOutput).map(i=> LensOption(i.name, i.lensRef.packageRef.get.full, i.lensRef.internalFull)).toSeq,
        None,
        if (insertLocationOption.isDefined) Seq(insertLocationOption.get) else Seq(), //@todo add all location options
        None,
        None,
        objectSelection,
        if (inputValue.isDefined) None else Some(modelOptions)
      ))
    }
  }

  override def asJson = {
    JsObject(Seq(
      "name" -> JsString(transformationChange.transformation.yields),
      "projectName" -> JsString(project.name),
      "editorSlug" -> JsString(editorSlug),
      "packageId" -> JsString(transformationChange.transformation.packageId.full),
      "input" -> JsString(transformationChange.transformation.resolvedInput.full),
      "output" -> JsString(transformationChange.transformation.resolvedOutput.full),
      "changes" -> changes.asJson
    ))
  }

}
