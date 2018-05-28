package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.StatusCodes
import com.opticdev.arrow.changes.ChangeGroup
import com.opticdev.arrow.changes.evaluation.BatchedChanges
import com.opticdev.arrow.results.Result
import com.opticdev.server.data.{APIResponse, ServerExceptions}
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsBoolean, JsObject, JsString}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class ArrowPostChanges(projectName: String, changeGroup: ChangeGroup)(implicit projectsManager: ProjectsManager) {

  implicit val nodeKeyStore = projectsManager.nodeKeyStore

  def execute()(implicit autorefreshes: Boolean) : Future[BatchedChanges] = Future {
    val project = projectsManager.lookupProject(projectName).toOption
    val arrow = projectsManager.lookupArrow(projectName).get

    changeGroup.evaluateAndWrite(arrow.sourcegear, project).get
  }

  def executeToApiResponse()(implicit autorefreshes: Boolean) : Future[APIResponse] = {
    import com.opticdev.server.data.ModelNodeJsonImplicits._
    execute.transform {
      case Success(batchedChanges: BatchedChanges) => {

        val updatedFiles = batchedChanges.stagedFiles.keys.map(i=> JsString(i.pathAsString)).toSeq

        if (batchedChanges.isSuccess) {
          Try(APIResponse(StatusCodes.OK, JsObject(Seq("success" -> JsBoolean(true), "updatedFiles" -> JsArray(updatedFiles)))))
        } else {
          Try(APIResponse(StatusCodes.BadRequest, JsObject(Seq("success" -> JsBoolean(false)))))
        }
      }
      case Failure(exception: ServerExceptions) => Try(APIResponse(StatusCodes.BadRequest, exception.asJson))
    }
  }



  //Run the request but don't push changes to disk. Return a preview for the client

  def stage : Future[BatchedChanges] = Future {
    val project = projectsManager.lookupProject(projectName).toOption
    val arrow = projectsManager.lookupArrow(projectName).get

    changeGroup.evaluate(arrow.sourcegear, project)
  }

  def stageToApiResponse : Future[APIResponse] = {
    import com.opticdev.server.data.ModelNodeJsonImplicits._
    stage.transform {
      case Success(batchedChanges: BatchedChanges) => {
        val updatedFiles: Seq[JsString] = batchedChanges.stagedFiles.keys.map(i=> JsString(i.pathAsString)).toSeq

        if (batchedChanges.isSuccess) {
          Try(APIResponse(StatusCodes.OK, JsObject(Seq("success" -> JsBoolean(true), "updatedFiles" -> JsArray(updatedFiles)))))
        } else {
          Try(APIResponse(StatusCodes.BadRequest, JsObject(Seq("success" -> JsBoolean(false)))))
        }
      }
      case Failure(exception: ServerExceptions) => Try(APIResponse(StatusCodes.BadRequest, exception.asJson))
    }
  }

}
