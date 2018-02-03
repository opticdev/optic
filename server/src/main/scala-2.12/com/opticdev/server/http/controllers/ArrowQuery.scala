package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.StatusCodes
import better.files.File
import com.opticdev.core.sourcegear.graph.model.LinkedModelNode
import com.opticdev.server.state.ProjectsManager
import com.opticdev.arrow.context.FileContext
import com.opticdev.arrow.results.Result
import com.opticdev.server.data.{APIResponse, ServerExceptions}
import play.api.libs.json.JsArray
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class ArrowQuery(file: File, query: String, range: Range, contentsOption: Option[String])(implicit projectsManager: ProjectsManager) {

  def execute : Future[Vector[Result]] = Future {
    val arrowOption = projectsManager.lookupArrow(file)

    if (arrowOption.isDefined) {
      arrowOption.get.search(query, FileContext(file, range))
    } else {
      Vector()
    }

  }

  def executeToApiResponse : Future[APIResponse] = {
    import com.opticdev.server.data.ModelNodeJsonImplicits._

    execute.transform {
      case Success(vector: Vector[Result]) => {
        implicit val project = projectsManager.lookupProject(file).get
        implicit val sourceGear = project.projectSourcegear

        Try(APIResponse(StatusCodes.OK, JsArray(vector.map(_.asJson))))
      }
      case Failure(exception: ServerExceptions) => Try(APIResponse(StatusCodes.NotFound, exception.asJson))
    }
  }

}