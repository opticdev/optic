package com.opticdev.core.sourcegear.actors

import akka.actor.Actor.Receive
import akka.actor.{Actor, Props, Terminated}
import akka.routing.{ActorRefRoutee, RoundRobinRoutingLogic, Router}
import akka.util.Timeout
import com.opticdev.core.sourcegear.graph.{FileNode, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.{ParseCache, SGConstants}

import concurrent.duration._
import akka.pattern.ask
import better.files.File
import com.opticdev.parsers.AstGraph

import scala.concurrent.Await

class ParseSupervisorActor() extends Actor {
  var router = {
    val routees = Vector.fill(SGConstants.parseWorkers) {
      val r = context.actorOf(Props[WorkerActor])
      context watch r
      ActorRefRoutee(r)
    }
    Router(RoundRobinRoutingLogic(), routees)
  }

  override def receive: Receive = handler(new ParseCache)

  def handler(parseCache: ParseCache) : Receive = {
    case request: ParseFile =>
      router.route(request, sender())
    case Terminated(a) =>
      router = router.removeRoutee(a)
      val r = context.actorOf(Props[WorkerActor])
      context watch r
      router = router.addRoutee(r)

    //cache events
    case AddToCache(file, graph) => context.become(handler(parseCache.add(file, graph)))
    case SetCache(newCache) => context.become(handler(newCache))
    case CacheSize => sender() ! parseCache.cache.size
    case ClearCache => context.become(handler(parseCache.clear))
    case CheckCacheFor(file) => sender() ! parseCache.get(file)
  }

}

object ParseSupervisorSyncAccess {
  implicit val timeout = Timeout(2 seconds)

  def setCache(newCache: ParseCache): Unit = {
    parserSupervisorRef ! SetCache(newCache)
  }
  def cacheSize : Int  = {
    val future = parserSupervisorRef ? CacheSize
    Await.result(future, timeout.duration).asInstanceOf[Int]
  }

  def lookup(file: FileNode) : Option[AstGraph] = {
    val future = parserSupervisorRef ? CheckCacheFor(file)
    Await.result(future, timeout.duration).asInstanceOf[Option[AstGraph]]
  }

}