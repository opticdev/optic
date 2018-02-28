package com.opticdev.arrow.results

import com.opticdev.arrow.changes.location.AsChildOf
import com.opticdev.arrow.changes.{ChangeGroup, GearOption, InsertModel, RunTransformation}
import com.opticdev.arrow.context.{ArrowContextBase, ModelContext}
import com.opticdev.arrow.graph.KnowledgeGraph
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.{DirectTransformation, TransformationChanges}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.sdk.descriptions.Transformation
import play.api.libs.json.{JsObject, JsString, JsValue}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits._
import com.opticdev.core.sourcegear.project.OpticProject

import scala.util.Try

case class TransformationResult(score: Int, transformationChange: TransformationChanges, context : ArrowContextBase, inputValue: JsObject)(implicit sourcegear: SourceGear, project: OpticProject, knowledgeGraph: KnowledgeGraph) extends Result {

  override def changes : ChangeGroup = transformationChange match {
    case dt: DirectTransformation => {

      val insertLocationOption = context.toInsertLocation

      ChangeGroup(RunTransformation(
        transformationChange,
        inputValue,
        knowledgeGraph.gearsForSchema(dt.transformation.output).map(i=> GearOption(i.name, i.packageFull, i.id)).toSeq,
        None,
        if (insertLocationOption.isDefined) Seq(insertLocationOption.get) else Seq(), //@todo add all location options
        None
      ))
    }
  }

  override def asJson = {
    JsObject(Seq(
      "name" -> JsString(transformationChange.transformation.name),
      "projectName" -> JsString(project.name),
      "packageId" -> JsString(transformationChange.transformation.packageId.full),
      "input" -> JsString(transformationChange.transformation.input.full),
      "output" -> JsString(transformationChange.transformation.output.full),
      "changes" -> changes.asJson
    ))
  }

}
