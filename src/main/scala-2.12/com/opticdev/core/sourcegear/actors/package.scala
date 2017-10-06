package com.opticdev.core.sourcegear

import akka.actor.{ActorRef, ActorSystem, Props}
import better.files.File
import com.opticdev.core.sourcegear.actors.ParseSupervisorActor
import com.opticdev.actorSystem
import com.opticdev.parsers._

package object actors {

  val (parserSupervisor, parserSupervisorRef) =
      (actorSystem.actorOf(Props[ParseSupervisorActor], "parseSupervisor"),
      actorSystem.actorSelection("user/parseSupervisor/"))

  //Parser Supervisor Recieve
  case class AddToCache(file: File, astGraph: AstGraph)
  case class CheckCacheFor(file: File)
  case object CacheSize
  case object ClearCache
  case class SetCache(newCache: ParseCache)

  //Parser Supervisor & Worker Receive
  case class ParseFile(file: File, project: ActorRef)(implicit val sourceGear: SourceGear)


  //Project Receives
  case class ParseSuccessful(parseResults: FileParseResults, file: File, project: ActorRef)
  case class ParseFailed(file: File)
  case class FileUpdated(file: File)(implicit val sourceGear: SourceGear)
  case class FileCreated(file: File)(implicit val sourceGear: SourceGear)
  case class FileDeleted(file: File)(implicit val sourceGear: SourceGear)
  case object CurrentGraph

}
