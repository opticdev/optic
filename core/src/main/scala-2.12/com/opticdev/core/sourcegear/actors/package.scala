package com.opticdev.core.sourcegear

import akka.actor.{ActorRef, ActorSystem, Props}
import better.files.File
import com.opticdev.core.sourcegear.actors.ParseSupervisorActor
import com.opticdev.core.actorSystem
import com.opticdev.core.sourcegear.annotations.FileNameAnnotation
import com.opticdev.core.sourcegear.graph.{FileNode, ProjectGraph}
import com.opticdev.core.sourcegear.project.{Project, ProjectBase}
import com.opticdev.parsers._

package object actors {

  //Parser Supervisor Recieve
  case class AddToCache(file: File, astGraph: AstGraph, parser: ParserBase, fileContents: String, fileNameAnnotationOption: Option[FileNameAnnotation])
  case class CheckCacheFor(file: File)
  case object CacheSize
  case object ClearCache
  case class SetCache(newCache: ParseCache)

  //Parser Supervisor & Worker Receive
  sealed trait ParserRequest {
    val file: File
    def contents: String
    def requestingActor: ActorRef
    def fromContextQuery: Boolean
  }
  case class ParseFile(file: File, requestingActor: ActorRef, project: ProjectBase, fromContextQuery: Boolean = false)(implicit val sourceGear: SourceGear) extends ParserRequest {
    def contents = file.contentAsString
  }
  case class ParseFileWithContents(file: File, contents: String, requestingActor: ActorRef, project: ProjectBase, fromContextQuery: Boolean = false)(implicit val sourceGear: SourceGear) extends ParserRequest


  //Project Receives
  sealed trait ParseStatus
  case class ParseSuccessful(parseResults: FileParseResults, file: File, fromCache: Boolean = false) extends ParseStatus
  case class ParseFailed(file: File, error: String) extends ParseStatus
  case class FileUpdatedInMemory(file: File, contents: String, project: ProjectBase, fromContextQuery: Boolean = false)(implicit val sourceGear: SourceGear)
  case class FileUpdated(file: File, project: ProjectBase)(implicit val sourceGear: SourceGear)
  case class FileCreated(file: File, project: ProjectBase)(implicit val sourceGear: SourceGear)
  case class FileDeleted(file: File, project: ProjectBase)(implicit val sourceGear: SourceGear)
  case object CurrentGraph
  case class SetCurrentGraph(projectGraph: ProjectGraph)
  case object ClearGraph
  case class AddConnectedProjectSubGraphs(subGraphs: Set[ProjectGraph])
  case class GetContext(file: File)(implicit val sourceGear: SourceGear, val project: ProjectBase)
  case class NodeForId(id: String)
  case class GetSnapshot(sourceGear: SourceGear, project: ProjectBase)

}
