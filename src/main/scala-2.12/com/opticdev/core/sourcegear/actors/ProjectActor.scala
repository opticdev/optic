package com.opticdev.core.sourcegear.actors

import akka.actor.{Actor, Props}
import akka.actor.Actor.Receive
import com.opticdev.core.sourcegear.graph.{ProjectGraph, ProjectGraphWrapper}
import com.opticdev.parsers.AstGraph

class ProjectActor(initialGraph: ProjectGraphWrapper) extends Actor {
  val parserActor = parserSupervisorRef

  override def receive: Receive = active(null)

  def active(graph: AstGraph): Receive = {
    //handle consequences of parsings
    case parsed: ParseSuccessful => println(parsed)
    case deleted: FileDeleted => println(deleted)



    //Forward parsing requests to the cluster supervisor
    case created: FileCreated => parserActor ! ParseFile(created.file)(created.sourceGear)
    case updated:FileUpdated => parserActor ! ParseFile(updated.file)(updated.sourceGear)
  }

}

object ProjectActor {
  def props(initialGraph: ProjectGraphWrapper): Props = Props(new ProjectActor(initialGraph))
}