package com.opticdev.core.sourcegear.actors

import akka.actor.{ActorRef, ActorSystem, Props}
import com.opticdev._
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.project.{OpticProject, ProjectBase}

class ActorCluster(actorSystem: ActorSystem) {
  val parserSupervisorRef : ActorRef = {
    actorSystem.actorOf(ParseSupervisorActor.props()(this))
  }

  def newProjectActor()(implicit logToCli : Boolean = false, project: ProjectBase) = {
    implicit val actorCluster = this
    actorSystem.actorOf(ProjectActor.props(ProjectGraphWrapper.empty))
  }

}
