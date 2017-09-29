package com.opticdev.core.sourcegear.actors

import akka.actor.{Actor, Props, Terminated}
import akka.routing.{ActorRefRoutee, RoundRobinRoutingLogic, Router}

sealed class ParseSupervisorActor extends Actor {
  var router = {
    val routees = Vector.fill(5) {
      val r = context.actorOf(Props[WorkerActor])
      context watch r
      ActorRefRoutee(r)
    }
    Router(RoundRobinRoutingLogic(), routees)
  }

  def receive = {
    case request: ParseFile =>
      router.route(request, sender())
    case Terminated(a) =>
      router = router.removeRoutee(a)
      val r = context.actorOf(Props[WorkerActor])
      context watch r
      router = router.addRoutee(r)
  }

}
