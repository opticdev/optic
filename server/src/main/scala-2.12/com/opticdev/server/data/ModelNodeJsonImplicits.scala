package com.opticdev.server.data

import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.server.state.ProjectsManager
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType
import play.api.libs.json._

import scala.util.Try
import com.opticdev.sdk.variableMappingFormat

object ModelNodeJsonImplicits {

  implicit class ModelNodeJson(modelNode: LinkedModelNode[CommonAstNode]) {

    def sourceGearContext()(implicit project: OpticProject) : SGContext = {
      implicit val sourceGear = project.projectSourcegear
      implicit val actorCluster = project.actorCluster
      val fileNode = modelNode.fileNode
      ParseSupervisorSyncAccess.getContext(fileNode.get.toFile).get
    }

    def asJson()(implicit projectsManager: ProjectsManager) : JsObject = {

      val fileNode = modelNode.fileNode

      implicit val project = projectsManager.lookupProject(fileNode.get.toFile).get
      implicit val sourceGear = project.projectSourcegear
      implicit val actorCluster = projectsManager.actorCluster
      implicit val sourceGearContext: SGContext = ParseSupervisorSyncAccess.getContext(fileNode.get.toFile).get

      //@todo factor this out
      val schemaOption = sourceGear.findSchema(modelNode.schemaId)

      JsObject(Seq(
        "id" -> JsString(projectsManager.nodeKeyStore.leaseId(fileNode.get.toFile, modelNode)),
        "schema" -> schemaOption.get.definition,
        "astLocation" -> JsObject(Seq(
          "type" -> JsString(modelNode.root.nodeType.asString),
          "start" -> JsNumber(modelNode.root.range.start),
          "end" -> JsNumber(modelNode.root.range.end)
        )),
        "value" -> modelNode.expandedValue(),
        "sync" -> JsObject(Seq(
          "name" -> modelNode.objectRef.map(i=> JsString(i.name)).getOrElse(JsNull),
          "source" -> modelNode.sourceAnnotation.map(_.asJson).getOrElse(JsNull)
        ))
      ))

    }

  }

}
