package com.opticdev.arrow.results

import com.opticdev.arrow.changes.{ChangeGroup, GearOption, InsertModel, RunTransformation}
import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.arrow.graph.KnowledgeGraph
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.{DirectTransformation, TransformationChanges}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.sdk.descriptions.Transformation
import play.api.libs.json.{JsObject, JsString, JsValue}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits._
import com.opticdev.core.sourcegear.project.OpticProject

case class TransformationResult(score: Int, transformationChange: TransformationChanges, context : ArrowContextBase)(implicit sourcegear: SourceGear, project: OpticProject, knowledgeGraph: KnowledgeGraph) extends Result {

  override def changes : ChangeGroup = transformationChange match {
    case dt: DirectTransformation => {
      ChangeGroup(RunTransformation(
        transformationChange,
        knowledgeGraph.gearsForSchema(dt.transformation.outputSchema).map(i=> GearOption(i.name, i.packageFull, i.id)).toSeq,
        Seq() //@todo add location options
      ))
    }
  }

  override def asJson = {
    JsObject(Seq(
      "name" -> JsString(transformationChange.transformation.name),
      "projectName" -> JsString(project.name),
      "packageId" -> JsString(transformationChange.transformation.packageId.full),
      "inputSchema" -> JsString(transformationChange.transformation.inputSchema.full),
      "outputSchema" -> JsString(transformationChange.transformation.outputSchema.full),
      "changes" -> changes.asJson
    ))
  }

}
