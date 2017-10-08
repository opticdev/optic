package com.opticdev.core.sourcegear.actors

import akka.actor.{Actor, ActorRef, Props}
import akka.actor.Actor.Receive
import com.opticdev.core.sourcegear.graph.{AstProjection, ProjectGraph, ProjectGraphWrapper}
import com.opticdev.parsers.AstGraph

import scala.concurrent.Await
import akka.pattern.ask
import akka.util.Timeout

import concurrent.duration._

class ProjectActor(initialGraph: ProjectGraphWrapper)(implicit logToCli: Boolean) extends Actor {

  override def receive: Receive = active(initialGraph)

  def active(graph: ProjectGraphWrapper): Receive = {
    //handle consequences of parsings
    case parsed: ParseSuccessful => {
      graph.updateFile(parsed.parseResults.astGraph, parsed.file)

      if (logToCli) graph.prettyPrint else parsed.project ! graph

      context.become(active(graph))
    }

    case i: ParseFailed => println("Failed to parse file "+ i.file)
    case deleted: FileDeleted => {
      graph.removeFile(deleted.file)

      if (logToCli) graph.prettyPrint else sender() ! graph

      context.become(active(graph))
    }

    case CurrentGraph => sender ! graph
    case NodeForId(id) => sender ! graph.nodeForId(id)

    //Forward parsing requests to the cluster supervisor
    case created: FileCreated => parserSupervisorRef ! ParseFile(created.file, sender())(created.sourceGear)
    case updated: FileUpdated => parserSupervisorRef ! ParseFile(updated.file, sender())(updated.sourceGear)
  }

}

object ProjectActor {
  def props(initialGraph: ProjectGraphWrapper)(implicit logToCli: Boolean): Props = Props(new ProjectActor(initialGraph))
}

object ProjectActorImplicits {
  implicit val timeout = Timeout(2 seconds)
  implicit class ProjectActorRef(projectActor: ActorRef) {
    def askForNode(id: String) = {
      val future = projectActor ? NodeForId(id)
      Await.result(future, timeout.duration).asInstanceOf[Option[AstProjection]]
    }
  }
}