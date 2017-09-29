package com.opticdev.core.sourcegear.actors

import akka.actor.Actor
import com.opticdev.core.sourcegear.{FileParseResults, SourceGear}

import scala.util.Try

sealed class WorkerActor extends Actor {
  override def receive: Receive = {
    case parseRequest : ParseFile => {
      val result: Try[FileParseResults] = parseRequest.sourceGear.parseFile(parseRequest.file)
      if (result.isSuccess) sender() ! ParseSuccessful(result.get) else ParseFailed(parseRequest.file)
    }
  }
}

