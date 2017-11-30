package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.{StatusCode, StatusCodes}
import akka.http.scaladsl.model.StatusCode._
import better.files.File
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.core.sourcegear.graph.{AstProjection, FileNode, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode}
import com.opticdev.server.data._
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.JsArray

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class ContextQuery(file: File, range: Range)(implicit projectsManager: ProjectsManager) {

  def execute : Future[Vector[LinkedModelNode]] = Future {
    val projectOption = projectsManager.lookupProject(file)
    if (projectOption.isFailure) throw new FileNotInProjectException(file)

    val graph = new ProjectGraphWrapper(projectOption.get.projectGraph)

    val fileGraph = graph.subgraphForFile(file)

    if (fileGraph.isDefined) {
      val o : Vector[ModelNode] = fileGraph.get.nodes.toVector.filter(i=>
        i.isNode && i.value.isInstanceOf[ModelNode]
      ).map(_.value.asInstanceOf[ModelNode])

      implicit val actorCluster = projectsManager.actorCluster
      val resolved = o.map(_.resolve())

      //filter only models where the ranges intersect
      resolved.filter(node=> (node.root.range intersect range).nonEmpty)

    } else {
      if (projectOption.get.shouldWatchFile(file)) {
        //wait for it to be processed
        Vector()
      } else {
        throw new FileIsNotWatchedByProjectException(file)
      }
    }
  }

  def executeToApiResponse : Future[APIResponse] = {
    import com.opticdev.server.data.ModelNodeJsonImplicits._

    execute.transform {
      case Success(vector: Vector[LinkedModelNode]) => {
        //@todo clean this up...way cleaner way possible
//        implicit val project = projectsManager.lookupProject(file).get
//        implicit val actorCluster = projectsManager.actorCluster
//        implicit val sourceGear = project.projectSourcegear
//        implicit val sourceGearContext = ParseSupervisorSyncAccess.getContext(file).get

        Try(APIResponse(StatusCodes.OK, JsArray(vector.map(_.asJson))))
      }
      case Failure(exception: ServerExceptions) => Try(APIResponse(StatusCodes.NotFound, exception.asJson))
    }
  }


}
