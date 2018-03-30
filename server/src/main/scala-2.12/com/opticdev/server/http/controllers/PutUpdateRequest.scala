package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.StatusCodes
import better.files.File
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsObject, JsString}
import com.opticdev.core.sourcegear.mutate.MutationSteps._
import com.opticdev.core.sourcegear.project.{OpticProject, ProjectBase}
import com.opticdev.core.sourcegear.project.monitoring.StagedContent
import com.opticdev.server.data.{APIResponse, ModelNodeWithIdNotFound, ServerExceptions}
import com.opticdev.server.http.routes.socket.editors.Protocol.FilesUpdated

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

//@todo Use Arrow for 'Put Update' request. Benefit: Less surface area to test/reason about. Limits ways to write to disk through the API to 1.

class PutUpdateRequest(id: String, newValue: JsObject)(implicit projectsManager: ProjectsManager) {


  def execute = Future[FilesUpdated] {

    implicit val actorCluster = projectsManager.actorCluster

    //@todo make sure that model is valid before approving.

    val modelNodeOption = projectsManager.nodeKeyStore.lookupId(id)
    if (modelNodeOption.isDefined) {

      implicit val project: ProjectBase = modelNodeOption.get.project
      implicit val sourceGearContext = modelNodeOption.get.getContext.get
      //@todo make this play nicely with out File monitoring system
      implicit val fileContents = sourceGearContext.fileContents

      val file = modelNodeOption.get.fileNode.get.toFile

      //@todo remove the filtering once we have end-end mutations for mapped schemas working
      val changes = collectFieldChanges(modelNodeOption.get, newValue).filter(_.isSuccess).map(_.get)
      val astChanges = handleChanges(changes)
      val combined = combineChanges(astChanges)

      val output = combined.toString()

      file.write(output)


      FilesUpdated(Map(file -> StagedContent(output)))

    } else {
      throw ModelNodeWithIdNotFound(id)
    }

  }

//  def executeToApiResponse : Future[APIResponse] = {
//
//    execute.transform {
//      case Success(file) => {
//        Try(APIResponse(StatusCodes.OK, JsObject(Seq("filesUpdated" -> JsArray(Seq(JsString(file.pathAsString)))))))
//      }
//      case Failure(exception: ServerExceptions) => Try(APIResponse(StatusCodes.NotFound, exception.asJson))
//    }
//  }

}
