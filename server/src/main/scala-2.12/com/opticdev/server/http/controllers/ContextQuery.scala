package com.opticdev.server.http.controllers

import akka.http.scaladsl.model.{StatusCode, StatusCodes}
import akka.http.scaladsl.model.StatusCode._
import better.files.File
import com.opticdev.arrow.context.ModelContext
import com.opticdev.arrow.results.Result
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.core.sourcegear.graph.{AstProjection, FileNode, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.graph.model._
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.server.data._
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsObject}

import scala.collection.{immutable, mutable}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class ContextQuery(file: File, range: Range, contentsOption: Option[String], editorSlug: String)(implicit projectsManager: ProjectsManager) {

  case class ContextQueryResults(modelNodes: Vector[ExpandedModelNode], availableTransformations: Vector[Result], project: OpticProject, editorSlug: String)

  def execute : Future[ContextQueryResults] = {

    val projectOption = projectsManager.lookupProject(file)

    def query: Future[Vector[ExpandedModelNode]] = Future {
      if (projectOption.isFailure) throw new FileNotInProjectException(file)

      implicit val nodeKeyStore = projectOption.map(_.projectActor).get

      val graph = new ProjectGraphWrapper(projectOption.get.projectGraph)(projectOption.get)

      val fileGraph = graph.subgraphForFile(file)

      if (fileGraph.isDefined) {

        implicit val project = projectOption.get
        implicit val actorClustor = project.actorCluster

        implicit val sourceGearContext = SGContext.forFile(file).get
        implicit val astGraph = sourceGearContext.astGraph

        import com.opticdev.core.sourcegear.graph.GraphImplicits._

//        println(fileGraph.get.modelNodes())

        val allModelNodes = fileGraph.get.modelNodes().filter(_.matchesSchema())

        val resolvedModelNodesByRange: Vector[LinkedModelNode[CommonAstNode]] = allModelNodes.collect{ case mn: ModelNode if !mn.internal => {
          val resolved = mn.resolveInGraph[CommonAstNode](astGraph)
          (resolved.root.range, resolved)
        }}.collect { case i if (i._1 intersect range.inclusive).nonEmpty => i._2 }

        val resolvedMultiModelNodesByRanges: Vector[MultiModelNode] = allModelNodes.collect{ case mmn: MultiModelNode => {
          (mmn.modelNodes.map(_.resolveInGraph[CommonAstNode](astGraph).root.range), mmn)
        }}.collect { case i if i._1.exists(nodeRange=> (nodeRange intersect range.inclusive).nonEmpty) => i._2 }

        resolvedMultiModelNodesByRanges ++ resolvedModelNodesByRange

      } else {
        val project = projectOption.get
        if (project.projectSourcegear.isLoaded && project.shouldWatchFile(file)) {
          //wait for it to be processed
          Vector()
        } else {
          throw new FileIsNotWatchedByProjectException(file)
        }
      }
    }

    def addTransformationsAndFinalize(modelResults: Vector[ExpandedModelNode]): Future[ContextQueryResults] = Future {
      val modelContext = ModelContext(file, range, modelResults.map(_.flatten))
      val arrow = projectsManager.lookupArrow(projectOption.get).get
      ContextQueryResults(modelResults, arrow.transformationsForContext(modelContext, editorSlug), projectOption.get, editorSlug)
    }

    if (contentsOption.isDefined && projectOption.isSuccess) {
      projectOption.get.stageFileContents(file, contentsOption.get, fromContextQuery = true)
        .flatMap(i=> query)
        .flatMap(i=> addTransformationsAndFinalize(i))
    } else {
      query.map(addTransformationsAndFinalize).flatten
    }

  }

}
