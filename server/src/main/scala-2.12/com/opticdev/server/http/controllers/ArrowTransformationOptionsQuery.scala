package com.opticdev.server.http.controllers

import com.opticdev.arrow.graph.KnowledgeGraphImplicits.DirectTransformation
import com.opticdev.arrow.results.{ModelOption, TransformationResult}
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import com.opticdev.server.state.ProjectsManager
import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
import com.opticdev.core.sourcegear.project.OpticProject
import play.api.libs.json.JsObject

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

case class ArrowTransformationOptions(transformationRef: TransformationRef, modelOptions: Seq[ModelOption])

class ArrowTransformationOptionsQuery(transformationRef: TransformationRef, project: OpticProject)(implicit projectsManager: ProjectsManager) {

  def execute() : Future[ArrowTransformationOptions] = Future {
    val transformationOption = project.projectSourcegear.findTransformation(transformationRef)

    implicit val sourceGear = project.projectSourcegear
    val transformation = transformationOption.get

    val modelOptions: Seq[ModelOption] = project.projectGraphWrapper.query((node)=> {
      node.value match {
        case mn: BaseModelNode => mn.schemaId == transformation.resolvedInput && mn.objectRef.isDefined
        case on: ObjectNode => on.schemaRef == transformation.resolvedInput
        case _ => false
      }
    }).map {
      case mn: BaseModelNode => {
        implicit val sourceGearContext: SGContext = {
          implicit val actorCluster = project.actorCluster
          val fileNode = mn.fileNode
          ParseSupervisorSyncAccess.getContext(fileNode.get.toFile)(actorCluster, project.projectSourcegear, project).get
        }
        val expandedValue = mn.expandedValue(withVariables = true)
        ModelOption(mn.id, expandedValue, mn.objectRef.get.name, Try(transformation.combinedAsk(expandedValue)).getOrElse(transformation.ask))
      }
      case on: ObjectNode =>
        ModelOption(on.id, on.value.as[JsObject], on.name, Try(transformation.combinedAsk(on.value.as[JsObject])).getOrElse(transformation.ask))
    }.toSeq.sortBy(_.name)


    ArrowTransformationOptions(transformationRef, modelOptions)
  }

}
