package com.opticdev.core.sourcegear

import akka.actor.{ActorRef, ActorSystem, Props}
import better.files.File
import com.opticdev.core.sourcegear.actors.ParseSupervisorActor
import com.opticdev.core.actorSystem
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers._
import com.opticdev.core.sourcegear.FileParseResults

package object actors {

  //Parser Supervisor Recieve
  case class AddToCache(file: FileNode, astGraph: AstGraph, parser: ParserBase, fileContents: String)
  case class CheckCacheFor(file: FileNode)
  case object CacheSize
  case object ClearCache
  case class SetCache(newCache: ParseCache)

  //Parser Supervisor & Worker Receive
  case class ParseFile(file: File, requestingActor: ActorRef, project: Project)(implicit val sourceGear: SourceGear)


  //Project Receives
  case class ParseSuccessful(parseResults: FileParseResults, file: File)
  case class ParseFailed(file: File)
  case class FileUpdated(file: File, project: Project)(implicit val sourceGear: SourceGear)
  case class FileCreated(file: File, project: Project)(implicit val sourceGear: SourceGear)
  case class FileDeleted(file: File, project: Project)(implicit val sourceGear: SourceGear)
  case object CurrentGraph
  case class GetContext(fileNode: FileNode)(implicit val sourceGear: SourceGear, val project: Project)
  case class NodeForId(id: String)

}
