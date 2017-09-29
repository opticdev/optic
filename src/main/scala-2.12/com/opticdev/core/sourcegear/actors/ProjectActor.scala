package com.opticdev.core.sourcegear.actors

import akka.actor.Actor
import akka.actor.Actor.Receive

sealed class ProjectActor extends Actor {
  val parserActor = parserSupervisorRef
  override def receive: Receive = {
    case a: ParseSuccessful => println(a)
  }
}
