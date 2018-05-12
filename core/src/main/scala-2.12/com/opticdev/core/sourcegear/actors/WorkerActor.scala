package com.opticdev.core.sourcegear.actors

import akka.actor.{Actor, Props}
import akka.dispatch.RequiresMessageQueue
import better.files.File
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.{FileNode, ProjectGraphWrapper}
import com.opticdev.parsers.AstGraph
import com.opticdev.core.sourcegear.FileParseResults
import com.opticdev.scala.akka.FaddishUnboundedMessageQueueSemantics

import scala.util.Try

class WorkerActor()(implicit actorCluster: ActorCluster) extends Actor with RequiresMessageQueue[FaddishUnboundedMessageQueueSemantics] {
  override def receive: Receive = {
    case parseRequest : ParseFile => {
      implicit val project = parseRequest.project
      val requestingActor = parseRequest.requestingActor
      val result: Try[FileParseResults] = parseRequest.sourceGear.parseFile(parseRequest.file)
      if (result.isSuccess) {
        actorCluster.parserSupervisorRef ! AddToCache(FileNode(parseRequest.file.pathAsString), result.get.astGraph, result.get.parser, result.get.fileContents)
        sender() tell(ParseSuccessful(result.get, parseRequest.file), requestingActor)
      } else {
        sender() tell(ParseFailed(parseRequest.file), requestingActor)
      }
    }

    case parseWithContentsRequest : ParseFileWithContents => {
      implicit val project = parseWithContentsRequest.project
      val requestingActor = parseWithContentsRequest.requestingActor
      val result: Try[FileParseResults] = parseWithContentsRequest.sourceGear.parseString(parseWithContentsRequest.contents)
      if (result.isSuccess) {
        actorCluster.parserSupervisorRef ! AddToCache(FileNode(parseWithContentsRequest.file.pathAsString), result.get.astGraph, result.get.parser, parseWithContentsRequest.contents)
        sender() tell(ParseSuccessful(result.get, parseWithContentsRequest.file), requestingActor)
      } else {
        sender() tell(ParseFailed(parseWithContentsRequest.file), requestingActor)
      }
    }

    case ctxRequest: GetContext => {
      implicit val project = ctxRequest.project
      val file = ctxRequest.fileNode.toFile
      val fileContents = project.filesStateMonitor.contentsForFile(file).get
      val result: Try[FileParseResults] = ctxRequest.sourceGear.parseString(fileContents)
      if (result.isSuccess) {
        actorCluster.parserSupervisorRef ! AddToCache(FileNode(file.pathAsString), result.get.astGraph, result.get.parser, result.get.fileContents)
        sender() ! Option(SGContext(
          ctxRequest.sourceGear.fileAccumulator,
          result.get.astGraph,
          result.get.parser,
          result.get.fileContents,
          ctxRequest.sourceGear,
          ctxRequest.fileNode.toFile
        ))
        ctxRequest.project.projectActor ! ParseSuccessful(result.get, file)
      } else {
        ctxRequest.project.projectActor ! ParseFailed(file)
        sender() ! None
      }

    }

  }
}

object WorkerActor {
  def props()(implicit actorCluster: ActorCluster) = Props(new WorkerActor)
}