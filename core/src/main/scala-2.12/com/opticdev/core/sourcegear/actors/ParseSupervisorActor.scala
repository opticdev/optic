package com.opticdev.core.sourcegear.actors

import akka.actor.Actor.Receive
import akka.actor.{Actor, ActorRef, ActorSystem, Props, Terminated}
import akka.routing.{ActorRefRoutee, RoundRobinRoutingLogic, Router, SeveralRoutees}
import akka.util.Timeout
import com.opticdev.core.sourcegear.graph.{FileNode, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.{SGContext, _}

import concurrent.duration._
import akka.pattern.ask
import better.files.File
import com.opticdev.core.sourcegear.project.{Project, ProjectBase}
import com.opticdev.core.sourcegear.token_value.FileTokenRegistry
import com.opticdev.parsers.AstGraph

import scala.concurrent.{Await, Future}
import com.opticdev.scala.akka.HashDispatchedRoutingLogic
class ParseSupervisorActor()(implicit actorCluster: ActorCluster) extends Actor {

  val dedicatedContextActor = context.actorOf(WorkerActor.props().withDispatcher("faddish-parse-worker-mailbox"))

  var router = {
    val routees = Vector.fill(SGConstants.parseWorkers) {
      val r = context.actorOf(WorkerActor.props().withDispatcher("faddish-parse-worker-mailbox"))
      context watch r
      ActorRefRoutee(r)
    }

    val routingLogic = HashDispatchedRoutingLogic({
      case pR: ParserRequest => Some(pR.file.pathAsString)
      case _ => None
    })

    Router(routingLogic, routees)
  }

  override def receive: Receive = handler(new ParseCache)

  //cache won't play nicely if files are in multiple projects with different sourcegears
  def handler(parseCache: ParseCache) : Receive = {
    case request: ParserRequest => {
      if (parseCache.isCurrentForFile(request.file, request.contents)) {
        sender() tell(ParseSuccessful(parseCache.get(request.file).get.asFileParseResults, request.file, fromCache = true), request.requestingActor)
      } else {
        if (request.fromContextQuery) {
          dedicatedContextActor tell (request, sender())
        } else {
          router.route(request, sender())
        }
      }
    }
    case Terminated(a) =>
      router = router.removeRoutee(a)
      val r = context.actorOf(Props[WorkerActor])
      context watch r
      router = router.addRoutee(r)

    case ctxRequest: GetContext => {
      val inCacheOption = parseCache.get(ctxRequest.file)
      if (inCacheOption.isDefined) {
        val record = inCacheOption.get
        sender() ! Option(
          SGContext(
            ctxRequest.sourceGear.fileAccumulator,
            record.graph,
            record.parser,
            record.fileContents,
            ctxRequest.sourceGear,
            ctxRequest.file,
            record.fileTokenRegistry
          )
        )
      } else {
        router.route(ctxRequest, sender())
      }
    }

    //cache events
    case AddToCache(file, graph, parser, fileContents, fileNameAnnotationOption, fileTokenRegistry) =>
      context.become(handler(parseCache.add(file, CacheRecord(graph, parser, fileContents, fileNameAnnotationOption, fileTokenRegistry))))
    case SetCache(newCache) => context.become(handler(newCache))
    case CacheSize => sender() ! parseCache.cache.size
    case ClearCache => context.become(handler(parseCache.clear))
    case CheckCacheFor(file) => sender() ! parseCache.get(file)
  }

}

object ParseSupervisorActor {
  def props()(implicit actorCluster: ActorCluster) = Props(new ParseSupervisorActor())
}

object ParseSupervisorSyncAccess {
  implicit val timeout: Timeout = Timeout(1 minute)

  def setCache(newCache: ParseCache) (implicit actorCluster: ActorCluster): Unit = {
    actorCluster.parserSupervisorRef ! SetCache(newCache)
  }

  def clearCache() (implicit actorCluster: ActorCluster): Unit = {
    actorCluster.parserSupervisorRef ! ClearCache
  }

  def cacheSize()(implicit actorCluster: ActorCluster) : Int  = {
    val future = actorCluster.parserSupervisorRef ? CacheSize
    Await.result(future, timeout.duration).asInstanceOf[Int]
  }

  def getContext(file: File)(implicit actorCluster: ActorCluster, sourceGear: SourceGear, project: ProjectBase): Option[SGContext] = {
    val future = actorCluster.parserSupervisorRef ? GetContext(file)
    Await.result(future, timeout.duration).asInstanceOf[Option[SGContext]]
  }

  def lookup(file: File)(implicit actorCluster: ActorCluster) : Option[AstGraph] = {
    val future = actorCluster.parserSupervisorRef ? CheckCacheFor(file)
    Await.result(future, timeout.duration).asInstanceOf[Option[AstGraph]]
  }

}