package com.opticdev.core.sourcegear.actors

import akka.actor.{Actor, Props}
import akka.actor.Actor.Receive
import com.opticdev.core.sourcegear.graph.{ProjectGraph, ProjectGraphWrapper}
import com.opticdev.parsers.AstGraph

class ProjectActor(initialGraph: ProjectGraphWrapper) extends Actor {
  val parserActor = parserSupervisorRef

  override def receive: Receive = active(initialGraph)

  def active(graph: ProjectGraphWrapper): Receive = {
    //handle consequences of parsings
    case parsed: ParseSuccessful => {
      graph.updateFile(parsed.parseResults.astGraph, parsed.file)
      parsed.project ! graph
      println("Updated Graph "+ graph.projectGraph)
      context.become(active(graph))
    }
    case deleted: FileDeleted => {
      graph.removeFile(deleted.file)
      sender() ! graph
      println("Updated Graph "+ graph.projectGraph)
      context.become(active(graph))
    }

    case CurrentGraph => sender ! graph

    //Forward parsing requests to the cluster supervisor
    case created: FileCreated => parserActor ! ParseFile(created.file, sender())(created.sourceGear)
    case updated: FileUpdated => parserActor ! ParseFile(updated.file, sender())(updated.sourceGear)
  }

}

object ProjectActor {
  def props(initialGraph: ProjectGraphWrapper): Props = Props(new ProjectActor(initialGraph))
}