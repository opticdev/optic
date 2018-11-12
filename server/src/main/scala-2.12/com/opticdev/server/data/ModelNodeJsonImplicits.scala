package com.opticdev.server.data

import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.core.sourcegear.graph.model.{ExpandedModelNode, LinkedModelNode, MultiModelNode}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.common.graph.CommonAstNode
import com.opticdev.server.state.ProjectsManager
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType
import play.api.libs.json._

import scala.util.Try
import com.opticdev.sdk.variableMappingFormat

object ModelNodeJsonImplicits {

  implicit class ExpandedModelNodeJson(node: ExpandedModelNode) {
    def asJson()(implicit projectsManager: ProjectsManager) : JsObject = {
      node match {
        case mn: LinkedModelNode[CommonAstNode] => mn.asJson()
        case mmn: MultiModelNode => mmn.asJson()
      }
    }
  }

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
      val schemaOption = sourceGear.findSchema(modelNode.schemaId).getOrElse(sourceGear.findLens(modelNode.parseGear.parsingLensRef).map(_.schema.right.get).get)

      JsObject(Seq(
        "id" -> JsString(project.nodeKeyStore.leaseId(fileNode.get.toFile, modelNode)),
        "schema" -> schemaOption.definition,
        "schemaRef" -> JsString(schemaOption.schemaRef.internalFull),
        "astLocation" -> JsObject(Seq(
          "type" -> JsString(modelNode.root.nodeType.asString),
          "start" -> JsNumber(modelNode.root.range.start),
          "end" -> JsNumber(modelNode.root.range.end)
        )),
        "value" -> modelNode.expandedValue(withVariables = true),
        "sync" -> JsObject(Seq(
          "name" -> modelNode.objectRef.map(i=> JsString(i.name)).getOrElse(JsNull),
          "source" -> modelNode.sourceAnnotation.map(_.asJson).getOrElse(JsNull)
        ))
      ))

    }

  }

  implicit class MultiModelNodeJson(multiModelNode: MultiModelNode) {

    def asJson()(implicit projectsManager: ProjectsManager) : JsObject = {
      val fileNode = multiModelNode.fileNode

      implicit val project = projectsManager.lookupProject(fileNode.get.toFile).get
      implicit val sourceGear = project.projectSourcegear
      implicit val actorCluster = projectsManager.actorCluster
      implicit val sourceGearContext: SGContext = ParseSupervisorSyncAccess.getContext(fileNode.get.toFile).get

      val schemaOption = sourceGear.findSchema(multiModelNode.schemaId)

      val range = multiModelNode.combinedRange(sourceGearContext.astGraph)

      JsObject(Seq(
        "id" -> JsString(project.nodeKeyStore.leaseId(fileNode.get.toFile, multiModelNode)),
        "schema" -> schemaOption.get.definition,
        "schemaRef" -> JsString(schemaOption.get.schemaRef.internalFull),
        "astLocation" -> JsObject(Seq(
          "start" -> JsNumber(range.start),
          "end" -> JsNumber(range.end)
        )),
        "value" -> multiModelNode.expandedValue(withVariables = true),
        "sync" -> JsObject(Seq(
          "name" -> multiModelNode.objectRef.map(i=> JsString(i.name)).getOrElse(JsNull),
          "source" -> multiModelNode.sourceAnnotation.map(_.asJson).getOrElse(JsNull)
        ))
      ))
    }
  }
}
