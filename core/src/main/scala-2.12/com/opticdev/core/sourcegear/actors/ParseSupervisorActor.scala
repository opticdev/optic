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
import com.opticdev.core.sourcegear.project.{ProjectBase, Project}
import com.opticdev.parsers.AstGraph

import scala.concurrent.{Await, Future}
import com.opticdev.scala.akka.HashDispatchedRoutingLogic
class ParseSupervisorActor()(implicit actorCluster: ActorCluster) extends Actor {
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

  def handler(parseCache: ParseCache) : Receive = {
    case request: ParserRequest =>
      router.route(request, sender())
    case Terminated(a) =>
      router = router.removeRoutee(a)
      val r = context.actorOf(Props[WorkerActor])
      context watch r
      router = router.addRoutee(r)

    case ctxRequest: GetContext => {
      val inCacheOption = parseCache.get(ctxRequest.fileNode)
      if (inCacheOption.isDefined) {
        val record = inCacheOption.get
        sender() ! Option(
          SGContext(
            ctxRequest.sourceGear.fileAccumulator,
            record.graph,
            record.parser,
            record.fileContents,
            ctxRequest.sourceGear)
        )
      } else {
        router.route(ctxRequest, sender())
      }
    }

    //cache events
    case AddToCache(file, graph, parser, fileContents) => context.become(handler(parseCache.add(file, CacheRecord(graph, parser, fileContents))))
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
  implicit val timeout: Timeout = Timeout(2 seconds)

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
    val future = actorCluster.parserSupervisorRef ? GetContext(FileNode.fromFile(file))
    Await.result(future, timeout.duration).asInstanceOf[Option[SGContext]]
  }

  def lookup(file: FileNode)(implicit actorCluster: ActorCluster) : Option[AstGraph] = {
    val future = actorCluster.parserSupervisorRef ? CheckCacheFor(file)
    Await.result(future, timeout.duration).asInstanceOf[Option[AstGraph]]
  }

}