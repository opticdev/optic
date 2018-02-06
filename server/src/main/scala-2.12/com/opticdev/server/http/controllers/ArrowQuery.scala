package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.StatusCodes
import better.files.File
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.server.state.ProjectsManager
import com.opticdev.arrow.context.{ArrowContextBase, FileContext, NoContext, ProjectContext}
import com.opticdev.arrow.results.Result
import com.opticdev.server.data.{APIResponse, ServerExceptions}
import com.opticdev.server.http.routes.socket.agents.Protocol.AgentSearch
import com.opticdev.server.http.routes.socket.editors.Protocol.EditorSearch
import play.api.libs.json.JsArray

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class ArrowQuery(query: String, file: Option[File], range: Option[Range], lastProjectName: Option[String], contentsOption: Option[String])(implicit projectsManager: ProjectsManager) {

  def execute : Future[Vector[Result]] = Future {
    val arrowOption = {
      if (file.isDefined) {
        projectsManager.lookupArrow(file.get)
      } else if (lastProjectName.isDefined) {
        projectsManager.lookupArrow(lastProjectName.get)
      } else {
        None
      }
    }

    val context : ArrowContextBase = {

      if (file.isDefined && range.isDefined) {
        FileContext(file.get, range.get)
      } else if (lastProjectName.isDefined) {
        ProjectContext(projectsManager.lookupProject(lastProjectName.get).get)
      } else {
        NoContext
      }

    }

    if (arrowOption.isDefined) {
      arrowOption.get.search(query, context)
    } else {
      Vector()
    }

  }

  def executeToApiResponse : Future[APIResponse] = {
    import com.opticdev.server.data.ModelNodeJsonImplicits._

    execute.transform {
      case Success(vector: Vector[Result]) => {
        Try(APIResponse(StatusCodes.OK, JsArray(vector.map(_.asJson))))
      }
      case Failure(exception: ServerExceptions) => Try(APIResponse(StatusCodes.NotFound, exception.asJson))
    }
  }

}

object ArrowQuery {

  def apply(agentSearch: AgentSearch, lastProjectName: Option[String] = None)(implicit projectsManager: ProjectsManager) : ArrowQuery = {
    new ArrowQuery(agentSearch.query, agentSearch.file, agentSearch.range, {
      if (lastProjectName.isDefined) {
        lastProjectName
      } else {
        agentSearch.lastProjectName
      }
    }, None)
  }

  def apply(editorSearch: EditorSearch)(implicit projectsManager: ProjectsManager) : ArrowQuery = {
    new ArrowQuery(editorSearch.query, Some(editorSearch.file), Some(editorSearch.range), None, None)
  }

}