package com.opticdev.core.sourcegear

import akka.actor.{ActorRef, ActorSystem, Props}
import better.files.File
import com.opticdev.core.sourcegear.actors.ParseSupervisorActor

package object actors {
  val actorSystem = ActorSystem("opticActors")
  val (parserSupervisor, parserSupervisorRef) =
    (actorSystem.actorOf(Props[ParseSupervisorActor], "parseSupervisor"),
      actorSystem.actorSelection("user/parseSupervisor/"))


  //Parser Supervisor & Worker Receive
  case class ParseFile(file: File)(implicit val sourceGear: SourceGear)

  //Project Receives
  case class ParseSuccessful(parseResults: FileParseResults)
  case class ParseFailed(file: File)

}
