package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.StatusCodes
import better.files.File
import com.opticdev.arrow.changes.evaluation.BatchedChanges
import com.opticdev.arrow.changes.{ChangeGroup, PutUpdate}
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsObject, JsString}
import com.opticdev.core.sourcegear.mutate.MutationSteps._
import com.opticdev.core.sourcegear.project.{OpticProject, ProjectBase}
import com.opticdev.core.sourcegear.project.monitoring.StagedContent
import com.opticdev.server.data.{APIResponse, ModelNodeWithIdNotFound, ServerExceptions}
import com.opticdev.server.http.routes.socket.editors.EditorConnection
import com.opticdev.server.http.routes.socket.editors.Protocol.FilesUpdated

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class PutUpdateRequest(id: String, newValue: JsObject, editorSlug: String)(implicit projectsManager: ProjectsManager) {
  implicit val nodeKeyStore = projectsManager.nodeKeyStore
  def execute = {
    implicit val actorCluster = projectsManager.actorCluster
    val modelNodeOption = projectsManager.nodeKeyStore.lookupId(id)
    if (modelNodeOption.isDefined) {
      implicit val project: ProjectBase = modelNodeOption.get.project
      implicit val sourceGearContext = modelNodeOption.get.getContext.get
      val file = modelNodeOption.get.fileNode.get.toFile
      implicit val autorefreshes = EditorConnection.listConnections.get(editorSlug).map(_.autorefreshes).getOrElse(false)
      new ArrowPostChanges(project.name, ChangeGroup(PutUpdate(id, newValue))).execute
    } else {
      Future(ModelNodeWithIdNotFound(id))
    }

  }

}
