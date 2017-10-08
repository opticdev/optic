package com.opticdev.core.sourcegear.actors

import akka.actor.{ActorRef, ActorSystem, Props}
import com.opticdev._
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper

class ActorCluster(actorSystem: ActorSystem) {
  val parserSupervisorRef : ActorRef = {
    actorSystem.actorOf(ParseSupervisorActor.props()(this), "parseSupervisor")
  }

  def newProjectActor()(implicit logToCli : Boolean = false) = {
    implicit val actorCluster = this
    actorSystem.actorOf(ProjectActor.props(ProjectGraphWrapper.empty))
  }

}
