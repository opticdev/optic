package com.opticdev.core.sourcegear.actors

import akka.actor.{Actor, Props}
import akka.dispatch.RequiresMessageQueue
import better.files.File
import com.opticdev.core.sourcegear.SGContext
import com.opticdev.core.sourcegear.graph.{FileNode, ProjectGraphWrapper}
import com.opticdev.parsers.{AstGraph, SourceParserManager}
import com.opticdev.core.sourcegear.FileParseResults
import com.opticdev.core.sourcegear.annotations.AnnotationParser
import com.opticdev.scala.akka.FaddishUnboundedMessageQueueSemantics

import scala.util.Try

class WorkerActor()(implicit actorCluster: ActorCluster) extends Actor with RequiresMessageQueue[FaddishUnboundedMessageQueueSemantics] {
  override def receive: Receive = {
    case parseRequest : ParseFile => {
      implicit val project = parseRequest.project
      val requestingActor = parseRequest.requestingActor
      val result: Try[FileParseResults] = parseRequest.sourceGear.parseFile(parseRequest.file)
      if (result.isSuccess) {
        actorCluster.parserSupervisorRef ! AddToCache(parseRequest.file, result.get.astGraph, result.get.parser, result.get.fileContents, result.get.fileNameAnnotationOption, result.get.fileTokenRegistry)
        sender() tell(ParseSuccessful(result.get, parseRequest.file), requestingActor)
      } else {
        sender() tell(ParseFailed(parseRequest.file, result.failed.get.getMessage), requestingActor)
      }
    }

    case parseWithContentsRequest : ParseFileWithContents => {
      implicit val project = parseWithContentsRequest.project
      val requestingActor = parseWithContentsRequest.requestingActor

      implicit val languageName = SourceParserManager.selectParserForFileName(parseWithContentsRequest.file.name).get.languageName

      val result: Try[FileParseResults] = parseWithContentsRequest.sourceGear.parseString(parseWithContentsRequest.contents)
      if (result.isSuccess) {
        actorCluster.parserSupervisorRef ! AddToCache(parseWithContentsRequest.file, result.get.astGraph, result.get.parser, parseWithContentsRequest.contents, result.get.fileNameAnnotationOption, result.get.fileTokenRegistry)
        sender() tell(ParseSuccessful(result.get, parseWithContentsRequest.file), requestingActor)
      } else {
        sender() tell(ParseFailed(parseWithContentsRequest.file, result.failed.get.getMessage), requestingActor)
      }
    }

    case ctxRequest: GetContext => {
      implicit val project = ctxRequest.project
      val file = ctxRequest.file
      val fileContents = project.filesStateMonitor.contentsForFile(file).get

      implicit val languageName = SourceParserManager.selectParserForFileName(ctxRequest.file.name).get.languageName

      val result: Try[FileParseResults] = ctxRequest.sourceGear.parseString(fileContents)
      if (result.isSuccess) {
        actorCluster.parserSupervisorRef ! AddToCache(file, result.get.astGraph, result.get.parser, result.get.fileContents, result.get.fileNameAnnotationOption, result.get.fileTokenRegistry)
        sender() ! Option(SGContext(
          ctxRequest.sourceGear.fileAccumulator,
          result.get.astGraph,
          result.get.parser,
          result.get.fileContents,
          ctxRequest.sourceGear,
          ctxRequest.file
        ))
        ctxRequest.project.projectActor ! ParseSuccessful(result.get, file)
      } else {
        ctxRequest.project.projectActor ! ParseFailed(file, result.failed.get.getMessage)
        sender() ! None
      }

    }

  }
}

object WorkerActor {
  def props()(implicit actorCluster: ActorCluster) = Props(new WorkerActor)
}