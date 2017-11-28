package com.opticdev.core.sourcegear.actors

import akka.actor.{Actor, ActorRef, Props}
import akka.actor.Actor.Receive
import com.opticdev.core.sourcegear.graph.{AstProjection, ProjectGraph, ProjectGraphWrapper}
import com.opticdev.parsers.AstGraph

import scala.concurrent.Await
import akka.pattern.ask
import akka.util.Timeout
import com.opticdev.core.sourcegear.ParseCache

import scala.concurrent.Future
import concurrent.duration._

class ProjectActor(initialGraph: ProjectGraphWrapper)(implicit logToCli: Boolean, actorCluster: ActorCluster) extends Actor {

  override def receive: Receive = active(initialGraph)

  def active(graph: ProjectGraphWrapper): Receive = {
    //handle consequences of parsings
    case parsed: ParseSuccessful => {
      graph.updateFile(parsed.parseResults.astGraph, parsed.file)

      if (logToCli) graph.prettyPrint else sender() ! graph

      context.become(active(graph))
    }

    case i: ParseFailed => println("Failed to parse file "+ i.file)
    case deleted: FileDeleted => {
      graph.removeFile(deleted.file)

      if (logToCli) graph.prettyPrint else sender() ! graph

      context.become(active(graph))
    }

    case CurrentGraph => sender ! graph
    case ClearGraph => {
      val emptyGraph = ProjectGraphWrapper.empty
      sender ! emptyGraph
      context.become(active(emptyGraph))
    }
    case NodeForId(id) => sender ! graph.nodeForId(id)

    //Forward parsing requests to the cluster supervisor
    case created: FileCreated => actorCluster.parserSupervisorRef ! ParseFile(created.file, sender(), created.project)(created.sourceGear)
    case updated: FileUpdated => actorCluster.parserSupervisorRef ! ParseFile(updated.file, sender(), updated.project)(updated.sourceGear)
  }

}

object ProjectActor {
  def props(initialGraph: ProjectGraphWrapper)(implicit logToCli: Boolean, actorCluster: ActorCluster): Props = Props(new ProjectActor(initialGraph))
}

object ProjectActorSyncAccess {
  implicit val timeout: Timeout = Timeout(2 seconds)

  def clearGraph(projectActor: ActorRef): Future[ProjectGraphWrapper] = {
    (projectActor ? ClearGraph).asInstanceOf[Future[ProjectGraphWrapper]]
  }
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