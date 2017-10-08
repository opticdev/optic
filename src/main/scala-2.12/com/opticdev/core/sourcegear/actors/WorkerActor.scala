package com.opticdev.core.sourcegear.actors

import akka.actor.Actor
import better.files.File
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.core.sourcegear.{FileParseResults, SourceGear}
import com.opticdev.parsers.AstGraph

import scala.util.Try

class WorkerActor extends Actor {
  override def receive: Receive = {

    case parseRequest : ParseFile => {
      val result: Try[FileParseResults] = parseRequest.sourceGear.parseFile(parseRequest.file)
      if (result.isSuccess) {
        parserSupervisor ! AddToCache(FileNode.fromFile(parseRequest.file), result.get.astGraph)
        sender() ! ParseSuccessful(result.get, parseRequest.file, parseRequest.project)
      } else {
        sender() ! ParseFailed(parseRequest.file)
      }
    }
  }
}


